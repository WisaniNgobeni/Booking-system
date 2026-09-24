import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../../lib/tenant";
import { canManageBusiness } from "../../../../lib/security";
import { writeAudit } from "../../../../lib/audit";

export async function GET() {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const business = await prisma.organization.findUnique({ where: { id: tenant.organizationId }, select: { name: true, slug: true, category: true, description: true, phone: true, email: true } });
    return business ? NextResponse.json({ business }) : NextResponse.json({ error: "Business not found." }, { status: 404 });
}

export async function PATCH(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!canManageBusiness(tenant.role)) return NextResponse.json({ error: "Business management permission required." }, { status: 403 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const body = await request.json();
    const fields = ["name", "slug", "category", "description", "phone", "email"] as const;
    if (fields.some((field) => body?.[field] !== undefined && typeof body[field] !== "string")) return NextResponse.json({ error: "Business details are invalid." }, { status: 400 });
    const data = Object.fromEntries(fields.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field].trim() || null]));
    if (typeof data.name !== "string" || data.name.length < 2) return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    if (typeof data.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) return NextResponse.json({ error: "Use lowercase letters, numbers, and hyphens for the booking link." }, { status: 400 });
    const { prisma } = await import("../../../../lib/database");
    try { const business = await prisma.organization.update({ where: { id: tenant.organizationId }, data }); await writeAudit(prisma, { organizationId: tenant.organizationId, actorId: tenant.user.id, action: "UPDATE_PROFILE", entity: "Organization", entityId: tenant.organizationId }); return NextResponse.json({ business }); }
    catch { return NextResponse.json({ error: "That booking link is already in use." }, { status: 409 }); }
}