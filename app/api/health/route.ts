import { NextResponse } from "next/server";

export async function GET() {
    const headers = { "Cache-Control": "no-store" };
    if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, database: "not-configured" }, { status: 503, headers });
    try {
        const { prisma } = await import("../../../lib/database");
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ ok: true, database: "connected" }, { headers });
    } catch {
        return NextResponse.json({ ok: false, database: "unavailable" }, { status: 503, headers });
    }
}