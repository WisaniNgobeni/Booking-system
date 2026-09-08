import { NextResponse } from "next/server";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_: Request, context: Context) {
    const { slug } = await context.params;
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Business directory is not configured." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const organization = await prisma.organization.findUnique({
        where: { slug },
        select: {
            name: true, slug: true, category: true, description: true, phone: true, email: true, timezone: true,
            services: { where: { active: true, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, description: true, price: true, durationMinutes: true } },
        },
    });
    if (!organization) return NextResponse.json({ error: "Business not found." }, { status: 404 });
    return NextResponse.json({ business: organization });
}