import { NextResponse } from "next/server";
import { appUrl, stripe } from "../../../../lib/billing";
import { getCurrentTenant } from "../../../../lib/tenant";
import { canManageBusiness } from "../../../../lib/security";

export async function POST() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!stripe || !process.env.DATABASE_URL) return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const subscription = await prisma.subscription.findUnique({ where: { organizationId: tenant.organizationId } });
    if (!subscription?.providerCustomerId) return NextResponse.json({ error: "No billing account exists yet." }, { status: 409 });
    const session = await stripe.billingPortal.sessions.create({ customer: subscription.providerCustomerId, return_url: `${appUrl()}/dashboard/profile` });
    return NextResponse.json({ url: session.url });
}
