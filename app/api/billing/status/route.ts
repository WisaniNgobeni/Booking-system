import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../../lib/tenant";

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const subscription = await prisma.subscription.findUnique({ where: { organizationId: tenant.organizationId }, select: { plan: true, status: true, currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, canceledAt: true, trialEnd: true, currency: true, providerCustomerId: true } });
    const details = subscription ? { ...subscription, hasBillingAccount: Boolean(subscription.providerCustomerId) } : { plan: "FREE", status: "TRIALING", hasBillingAccount: false, currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, canceledAt: null, trialEnd: null, currency: "ZAR" };
    if (details && "providerCustomerId" in details) delete (details as { providerCustomerId?: string }).providerCustomerId;
    return NextResponse.json({ subscription: details });
}
