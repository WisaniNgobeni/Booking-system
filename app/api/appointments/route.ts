import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../lib/tenant";

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../lib/database");
    const appointments = await prisma.appointment.findMany({ where: { organizationId: tenant.organizationId }, include: { customer: true, service: true, staff: true }, orderBy: { startsAt: "asc" }, take: 100 });
    return NextResponse.json({ appointments });
}

export async function PATCH(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required for appointment updates." }, { status: 503 });
    const body = await request.json();
    if (typeof body?.id !== "string" || !["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(body.status)) return NextResponse.json({ error: "Invalid appointment update." }, { status: 400 });
    const { prisma } = await import("../../../lib/database");
    const appointment = await prisma.appointment.updateMany({ where: { id: body.id, organizationId: tenant.organizationId }, data: { status: body.status } });
    if (!appointment.count) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
}