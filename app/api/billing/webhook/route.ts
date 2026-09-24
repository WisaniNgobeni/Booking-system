import { NextResponse } from "next/server";
import Stripe from "stripe";
import { shouldApplySubscriptionEvent, stripe, subscriptionSnapshot } from "../../../../lib/billing";
import { captureException } from "../../../../lib/monitoring";

function providerId(value: unknown) {
    return typeof value === "string" ? value : value && typeof value === "object" && "id" in value && typeof value.id === "string" ? value.id : undefined;
}

function metadataOrganizationId(object: Stripe.Metadata | null | undefined) {
    const organizationId = object?.organizationId;
    if (!organizationId || typeof organizationId !== "string") throw new Error("Stripe metadata is missing organizationId.");
    return organizationId;
}

async function subscriptionFromEvent(event: Stripe.Event) {
    if (!stripe) throw new Error("Stripe is not configured.");
    const object = event.data.object as Stripe.Subscription | Stripe.Checkout.Session | Stripe.Invoice;
    if (event.type === "checkout.session.completed") {
        const session = object as Stripe.Checkout.Session;
        const subscriptionId = providerId(session.subscription as string | Stripe.Subscription | null | undefined);
        if (!subscriptionId) throw new Error("Checkout session is missing a subscription ID.");
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        return { subscription, organizationId: metadataOrganizationId(session.metadata) };
    }
    if (event.type.startsWith("customer.subscription.")) {
        const subscription = object as Stripe.Subscription;
        return { subscription, organizationId: metadataOrganizationId(subscription.metadata) };
    }
    const invoice = object as Stripe.Invoice;
    const subscriptionId = providerId((invoice as unknown as { parent?: { subscription_details?: { subscription?: string | Stripe.Subscription | null } } }).parent?.subscription_details?.subscription);
    if (!subscriptionId) throw new Error("Invoice is missing a subscription ID.");
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return { subscription, organizationId: metadataOrganizationId(subscription.metadata) };
}

export async function POST(request: Request) {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.DATABASE_URL) return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        captureException(error, { provider: "stripe", event: "webhook_signature" });
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
    const { prisma } = await import("../../../../lib/database");
    const eventCreatedAt = new Date(event.created * 1000);
    const existing = await prisma.billingEvent.findUnique({ where: { id: event.id } });
    if (existing?.status === "PROCESSED") return NextResponse.json({ received: true, duplicate: true });
    const processingLeaseExpired = existing?.processingStartedAt && existing.processingStartedAt.getTime() < Date.now() - 15 * 60_000;
    if (existing?.status === "PROCESSING" && !processingLeaseExpired) return NextResponse.json({ error: "Webhook is already being processed." }, { status: 409 });
    if (existing) await prisma.billingEvent.update({ where: { id: event.id }, data: { status: "PROCESSING", processingStartedAt: new Date(), errorMessage: null } });
    else {
        try { await prisma.billingEvent.create({ data: { id: event.id, type: event.type, status: "PROCESSING", processingStartedAt: new Date(), stripeCreatedAt: eventCreatedAt } }); }
        catch (error) {
            const duplicate = await prisma.billingEvent.findUnique({ where: { id: event.id } });
            if (duplicate?.status === "PROCESSED") return NextResponse.json({ received: true, duplicate: true });
            if (duplicate?.status === "PROCESSING" && duplicate.processingStartedAt && duplicate.processingStartedAt.getTime() >= Date.now() - 15 * 60_000) return NextResponse.json({ error: "Webhook is already being processed." }, { status: 409 });
            captureException(error, { provider: "stripe", eventId: event.id });
            return NextResponse.json({ error: "Unable to record webhook event." }, { status: 503 });
        }
    }
    try {
        const handled = ["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"].includes(event.type);
        if (handled) {
            const { subscription, organizationId } = await subscriptionFromEvent(event);
            const snapshot = subscriptionSnapshot(subscription);
            const status = event.type === "invoice.payment_failed" ? "PAST_DUE" as const : snapshot.status;
            const customerId = providerId(subscription.customer);
            if (!customerId) throw new Error("Stripe subscription is missing a customer ID.");
            await prisma.$transaction(async (transaction) => {
                const local = await transaction.subscription.findUnique({ where: { organizationId } });
                if (!local) throw new Error("Organization subscription record was not found.");
                if (local.providerSubscriptionId && local.providerSubscriptionId !== subscription.id) throw new Error("Stripe subscription does not belong to this organization.");
                if (shouldApplySubscriptionEvent(local.lastStripeEventCreatedAt, eventCreatedAt)) await transaction.subscription.update({ where: { organizationId }, data: { plan: snapshot.plan, providerCustomerId: customerId, providerSubscriptionId: subscription.id, providerPriceId: snapshot.providerPriceId, providerProductId: snapshot.providerProductId, status, currency: snapshot.currency, currentPeriodStart: snapshot.currentPeriodStart, currentPeriodEnd: snapshot.currentPeriodEnd, cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd, canceledAt: snapshot.canceledAt, trialEnd: snapshot.trialEnd, lastStripeEventCreatedAt: eventCreatedAt, lastSyncedAt: new Date() } });
                await transaction.billingEvent.update({ where: { id: event.id }, data: { status: "PROCESSED", processedAt: new Date(), processingStartedAt: null, organizationId, providerSubscriptionId: subscription.id, stripeCreatedAt: eventCreatedAt, errorMessage: null } });
            });
        } else {
            await prisma.billingEvent.update({ where: { id: event.id }, data: { status: "PROCESSED", processedAt: new Date(), processingStartedAt: null } });
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        captureException(error, { provider: "stripe", eventId: event.id, eventType: event.type });
        await prisma.billingEvent.update({ where: { id: event.id }, data: { status: "FAILED", processingStartedAt: null, errorMessage: error instanceof Error ? error.message.slice(0, 190) : "Webhook processing failed" } });
        return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
    }
}
