import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../../lib/tenant";
import { canManageBusiness } from "../../../../lib/security";

const defaultHours = Array.from({ length: 7 }, (_, weekday) => ({ weekday, startMinutes: 9 * 60, endMinutes: 17 * 60, enabled: weekday > 0 && weekday < 6 }));

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const hours = await prisma.workingHours.findMany({ where: { organizationId: tenant.organizationId, staffId: null }, orderBy: { weekday: "asc" } });
    return NextResponse.json({ hours: hours.length ? hours : defaultHours });
}

export async function PUT(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const body = await request.json();
    if (!Array.isArray(body?.hours) || body.hours.length !== 7) return NextResponse.json({ error: "Provide seven days of hours." }, { status: 400 });
    if (body.hours.some((item: any) => !Number.isInteger(item.weekday) || item.weekday < 0 || item.weekday > 6 || !Number.isInteger(item.startMinutes) || !Number.isInteger(item.endMinutes) || item.startMinutes < 0 || item.endMinutes > 1440 || item.startMinutes >= item.endMinutes)) return NextResponse.json({ error: "Check the opening and closing times." }, { status: 400 });
    const { prisma } = await import("../../../../lib/database");
    await prisma.$transaction(async (transaction) => { await transaction.workingHours.deleteMany({ where: { organizationId: tenant.organizationId, staffId: null } }); await transaction.workingHours.createMany({ data: body.hours.filter((item: any) => item.enabled).map((item: any) => ({ organizationId: tenant.organizationId, weekday: item.weekday, startMinutes: item.startMinutes, endMinutes: item.endMinutes })) }); });
    return NextResponse.json({ ok: true });
}