import { NextResponse } from "next/server";
import { consumeAuthToken } from "../../../../lib/account";
import { hashPassword } from "../../../../lib/auth";
import { rateLimit, requestAddress } from "../../../../lib/security";

export async function POST(request: Request) {
    const limited = rateLimit(`reset-password:${requestAddress(request)}`, 5, 60 * 60_000);
    if (limited) return limited;
    try {
        const body = await request.json();
        const token = typeof body?.token === "string" ? body.token : "";
        const password = typeof body?.password === "string" ? body.password : "";
        if (!token || password.length < 8) return NextResponse.json({ error: "A valid token and password of at least 8 characters are required." }, { status: 400 });
        if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Password recovery is not configured." }, { status: 503 });
        const user = await consumeAuthToken(token, "PASSWORD_RESET");
        if (!user) return NextResponse.json({ error: "That recovery link is invalid or expired." }, { status: 400 });
        const { prisma } = await import("../../../../lib/database");
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } }),
            prisma.session.deleteMany({ where: { userId: user.id } }),
        ]);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Unable to reset password." }, { status: 400 });
    }
}
