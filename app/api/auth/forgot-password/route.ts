import { NextResponse } from "next/server";
import { issueAuthToken, queueAccountEmail } from "../../../../lib/account";
import { rateLimit, requestAddress } from "../../../../lib/security";

export async function POST(request: Request) {
    const limited = rateLimit(`forgot-password:${requestAddress(request)}`, 5, 60 * 60_000);
    if (limited) return limited;
    try {
        const body = await request.json();
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
        if (process.env.DATABASE_URL) {
            const { prisma } = await import("../../../../lib/database");
            const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
            if (user) await queueAccountEmail(user.id, "PASSWORD_RESET", await issueAuthToken(user.id, "PASSWORD_RESET"));
        }
        return NextResponse.json({ message: "If an account exists for that email, recovery instructions are on the way." });
    } catch {
        return NextResponse.json({ error: "Unable to process the request." }, { status: 400 });
    }
}
