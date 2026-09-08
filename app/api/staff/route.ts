import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../lib/tenant";
import { canManageBusiness } from "../../../lib/security";

async function tenantForWrite() {
    const tenant = await getCurrentTenant();
    if (!tenant) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) } as const;
    if (!canManageBusiness(tenant.role)) return { error: NextResponse.json({ error: "Business management permission required." }, { status: 403 }) } as const;
    if (!process.env.DATABASE_URL) return { error: NextResponse.json({ error: "Persistent storage is required." }, { status: 503 }) } as const;
    return { tenant } as const;
}

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../lib/database");
    const staff = await prisma.staffMember.findMany({ where: { organizationId: tenant.organizationId }, include: { services: { include: { service: true } } }, orderBy: { name: "asc" } });
    return NextResponse.json({ staff });
}

export async function POST(request: Request) {
    const result = await tenantForWrite(); if ("error" in result) return result.error;
    const body = await request.json();
    if (typeof body?.name !== "string" || body.name.trim().length < 2) return NextResponse.json({ error: "Staff name is required." }, { status: 400 });
    if (body.email !== undefined && body.email !== null && typeof body.email !== "string") return NextResponse.json({ error: "Staff email is invalid." }, { status: 400 });
    const { prisma } = await import("../../../lib/database");
    const staff = await prisma.staffMember.create({ data: { organizationId: result.tenant.organizationId, name: body.name.trim(), email: body.email?.trim() || null, phone: typeof body.phone === "string" ? body.phone.trim() : null, bio: typeof body.bio === "string" ? body.bio.trim() : null } });
    return NextResponse.json({ staff }, { status: 201 });
}

export async function DELETE(request: Request) {
    const result = await tenantForWrite(); if ("error" in result) return result.error;
    const id = new URL(request.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Staff id is required." }, { status: 400 });
    const { prisma } = await import("../../../lib/database"); const deleted = await prisma.staffMember.updateMany({ where: { id, organizationId: result.tenant.organizationId }, data: { active: false } });
    return deleted.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Staff member not found." }, { status: 404 });
}