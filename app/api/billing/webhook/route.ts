import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, subscriptionStatus } from "../../../../lib/billing";

export async function POST(request: Request) {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.DATABASE_URL) return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
    const { prisma } = await import("../../../../lib/database");
    try {
        await prisma.billingEvent.create({ data: { id: event.id, type: event.type } });
    } catch {
        return NextResponse.json({ received: true, duplicate: true });
    }
    const object = event.data.object as Stripe.Subscription | Stripe.Checkout.Session;
    const organizationId = object.metadata?.organizationId;
    if (organizationId && (event.type === "checkout.session.completed" || event.type.startsWith("customer.subscription."))) {
        const subscription = event.type === "checkout.session.completed" ? null : object as Stripe.Subscription;
        const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
        if (subscription) {
            const periodEnd = subscription.items.data[0]?.current_period_end;
            await prisma.subscription.update({ where: { organizationId }, data: { plan: subscription.items.data[0]?.price.lookup_key || subscription.metadata?.plan || "PRO", providerCustomerId: customerId, providerSubscriptionId: subscription.id, status: subscriptionStatus(subscription.status), currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null } });
        } else {
            const session = object as Stripe.Checkout.Session;
            await prisma.subscription.update({ where: { organizationId }, data: { plan: session.metadata?.plan || "PRO", providerCustomerId: customerId } });
        }
    }
    return NextResponse.json({ received: true });
}
