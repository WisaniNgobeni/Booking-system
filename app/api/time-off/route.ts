import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../lib/tenant";
import { canManageBusiness } from "../../../lib/security";

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../lib/database");
    const timeOff = await prisma.timeOff.findMany({ where: { organizationId: tenant.organizationId }, orderBy: { startsAt: "asc" }, include: { staff: true } });
    return NextResponse.json({ timeOff });
}

export async function POST(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const body = await request.json(); const startsAt = new Date(body?.startsAt); const endsAt = new Date(body?.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) return NextResponse.json({ error: "Choose a valid time-off range." }, { status: 400 });
    const { prisma } = await import("../../../lib/database");
    const timeOff = await prisma.timeOff.create({ data: { organizationId: tenant.organizationId, staffId: typeof body.staffId === "string" && body.staffId ? body.staffId : null, startsAt, endsAt, reason: typeof body.reason === "string" ? body.reason.trim() : null } });
    return NextResponse.json({ timeOff }, { status: 201 });
}

export async function DELETE(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const id = new URL(request.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Time-off id is required." }, { status: 400 });
    const { prisma } = await import("../../../lib/database"); const deleted = await prisma.timeOff.deleteMany({ where: { id, organizationId: tenant.organizationId } });
    return deleted.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Time-off record not found." }, { status: 404 });
}