import { NextResponse } from "next/server";
import { appUrl, canStartCheckout, priceIdForPlan, stripe } from "../../../../lib/billing";
import { getCurrentTenant } from "../../../../lib/tenant";
import { canManageBusiness } from "../../../../lib/security";

export async function POST(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!stripe || !process.env.DATABASE_URL) return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    try {
        const body = await request.json();
        const plan = typeof body?.plan === "string" ? body.plan.toUpperCase() : "";
        if (!["PRO", "BUSINESS"].includes(plan)) return NextResponse.json({ error: "Choose a valid billing plan." }, { status: 400 });
        const { prisma } = await import("../../../../lib/database");
        const [organization, subscription] = await Promise.all([
            prisma.organization.findUnique({ where: { id: tenant.organizationId }, select: { name: true, email: true } }),
            prisma.subscription.findUnique({ where: { organizationId: tenant.organizationId } }),
        ]);
        if (!organization) return NextResponse.json({ error: "Business not found." }, { status: 404 });
        if (!canStartCheckout(subscription?.status)) return NextResponse.json({ error: "This organization already has a Stripe subscription. Use Manage billing to change it." }, { status: 409 });
        let customerId = subscription?.providerCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({ email: organization.email || undefined, name: organization.name, metadata: { organizationId: tenant.organizationId } });
            customerId = customer.id;
            await prisma.subscription.update({ where: { organizationId: tenant.organizationId }, data: { providerCustomerId: customerId } });
        }
        const priceId = priceIdForPlan(plan);
        const session = await stripe.checkout.sessions.create({ mode: "subscription", customer: customerId, line_items: [{ price: priceId, quantity: 1 }], success_url: `${appUrl()}/dashboard/profile?billing=success`, cancel_url: `${appUrl()}/dashboard/profile?billing=cancelled`, metadata: { organizationId: tenant.organizationId, plan }, subscription_data: { metadata: { organizationId: tenant.organizationId, plan } } }, { idempotencyKey: `checkout:${tenant.organizationId}:${priceId}` });
        return NextResponse.json({ url: session.url });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error && error.message.includes("not configured") ? error.message : "Unable to start checkout." }, { status: 400 });
    }
}
