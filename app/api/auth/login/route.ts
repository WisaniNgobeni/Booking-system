import { NextResponse } from "next/server";
import { loginUser, getUserFromSession } from "../../../../lib/auth";
import { rateLimit, requestAddress } from "../../../../lib/security";

export async function POST(request: Request) {
    const limited = rateLimit(`login:${requestAddress(request)}`, 8, 15 * 60_000);
    if (limited) return limited;
    try {
        const body = await request.json();
        if (typeof body?.email !== "string" || typeof body?.password !== "string") throw new Error("Email and password are required.");
        const token = await loginUser(body.email, body.password);
        const user = await getUserFromSession(token);
        const response = NextResponse.json({ user: user && { id: user.id, name: user.name, email: user.email } });
        response.cookies.set("smallbean_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
        return response;
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, { status: 401 }); }
}