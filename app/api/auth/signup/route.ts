import { NextResponse } from "next/server";
import { registerUser, loginUser } from "../../../../lib/auth";
import { issueAuthToken, queueAccountEmail } from "../../../../lib/account";
import { rateLimit, requestAddress } from "../../../../lib/security";

export async function POST(request: Request) {
    const limited = await rateLimit(`signup:${requestAddress(request)}`, 5, 60 * 60_000);
    if (limited) return limited;
    try {
        const body = await request.json();
        if (typeof body?.name !== "string" || typeof body?.email !== "string" || typeof body?.password !== "string") throw new Error("Name, email, and password are required.");
        const user = await registerUser(body.name, body.email, body.password);
        if (process.env.DATABASE_URL && user.id) await queueAccountEmail(user.id, "EMAIL_VERIFICATION", await issueAuthToken(user.id, "EMAIL_VERIFICATION"));
        const token = await loginUser(body.email, body.password);
        const response = NextResponse.json({ user }, { status: 201 });
        response.cookies.set("smallbean_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
        return response;
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 400 }); }
}