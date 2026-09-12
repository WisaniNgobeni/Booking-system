import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../../lib/tenant";

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const subscription = await prisma.subscription.findUnique({ where: { organizationId: tenant.organizationId }, select: { plan: true, status: true, currentPeriodEnd: true, providerCustomerId: true } });
    return NextResponse.json({ subscription });
}
