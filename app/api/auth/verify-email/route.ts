import { NextResponse } from "next/server";
import { consumeAuthToken } from "../../../../lib/account";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = typeof body?.token === "string" ? body.token : "";
        if (!token || !process.env.DATABASE_URL) return NextResponse.json({ error: "That verification link is invalid or expired." }, { status: 400 });
        const user = await consumeAuthToken(token, "EMAIL_VERIFICATION");
        if (!user) return NextResponse.json({ error: "That verification link is invalid or expired." }, { status: 400 });
        const { prisma } = await import("../../../../lib/database");
        await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "That verification link is invalid or expired." }, { status: 400 });
    }
}
