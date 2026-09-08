import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../lib/tenant";
export async function GET() { const tenant = await getCurrentTenant(); if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 }); const { prisma } = await import("../../../lib/database"); const services = await prisma.service.findMany({ where: { organizationId: tenant.organizationId, deletedAt: null }, include: { _count: { select: { appointments: true } } }, orderBy: { name: "asc" } }); return NextResponse.json({ services }); }

function serviceInput(body: unknown) {
    if (!body || typeof body !== "object") throw new Error("Service details are required.");
    const value = body as Record<string, unknown>;
    if (typeof value.name !== "string" || !value.name.trim()) throw new Error("Service name is required.");
    if (typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0) throw new Error("Enter a valid price.");
    if (typeof value.durationMinutes !== "number" || !Number.isInteger(value.durationMinutes) || value.durationMinutes < 5 || value.durationMinutes > 1440) throw new Error("Enter a valid duration.");
    return { name: value.name.trim(), description: typeof value.description === "string" ? value.description.trim() : null, price: value.price, durationMinutes: value.durationMinutes };
}

export async function POST(request: Request) {
    try { const tenant = await getCurrentTenant(); if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 }); const { prisma } = await import("../../../lib/database"); const service = await prisma.service.create({ data: { organizationId: tenant.organizationId, ...serviceInput(await request.json()) } }); return NextResponse.json({ service }, { status: 201 }); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create service." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
    try { const tenant = await getCurrentTenant(); if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 }); const body = await request.json(); if (typeof body?.id !== "string") throw new Error("Service id is required."); const { prisma } = await import("../../../lib/database"); const data = body.active === undefined ? serviceInput(body) : { active: Boolean(body.active) }; const result = await prisma.service.updateMany({ where: { id: body.id, organizationId: tenant.organizationId, deletedAt: null }, data }); if (!result.count) return NextResponse.json({ error: "Service not found." }, { status: 404 }); return NextResponse.json({ ok: true }); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update service." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
    const tenant = await getCurrentTenant(); if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 }); const id = new URL(request.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Service id is required." }, { status: 400 }); const { prisma } = await import("../../../lib/database"); const result = await prisma.service.updateMany({ where: { id, organizationId: tenant.organizationId, deletedAt: null }, data: { deletedAt: new Date(), active: false } }); return result.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Service not found." }, { status: 404 });
}