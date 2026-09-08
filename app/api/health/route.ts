import { NextResponse } from "next/server";

export async function GET() {
    if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, database: "not-configured" }, { status: 503 });
    try {
        const { prisma } = await import("../../../lib/database");
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ ok: true, database: "connected" });
    } catch {
        return NextResponse.json({ ok: false, database: "unavailable" }, { status: 503 });
    }
}