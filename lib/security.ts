import { NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export function requestAddress(request: Request) {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
    const retryAfter = checkRateLimit(key, limit, windowMs);
    if (retryAfter !== null) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    return null;
}

export function canManageBusiness(role: string) { return role === "OWNER" || role === "ADMIN"; }