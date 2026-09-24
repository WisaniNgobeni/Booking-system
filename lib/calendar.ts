import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const key = () => createHash("sha256").update(process.env.AUTH_SECRET || "development-only-calendar-key").digest();

export function encryptSecret(value: string) {
    const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key(), iv); const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
    const [ivValue, tagValue, encryptedValue] = value.split(".");
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivValue, "base64url")); decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
}

export function oauthConfig(provider: "google" | "microsoft") {
    return provider === "google" ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, authorize: "https://accounts.google.com/o/oauth2/v2/auth", token: "https://oauth2.googleapis.com/token", scope: "openid email https://www.googleapis.com/auth/calendar.events" } : { clientId: process.env.MICROSOFT_CLIENT_ID, clientSecret: process.env.MICROSOFT_CLIENT_SECRET, authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize", token: "https://login.microsoftonline.com/common/oauth2/v2.0/token", scope: "openid email offline_access Calendars.ReadWrite" };
}

export function oauthRedirect(provider: string) { return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calendar/${provider}/callback`; }

export function signOAuthState(organizationId: string) {
    const payload = Buffer.from(JSON.stringify({ organizationId, nonce: randomBytes(16).toString("hex"), issuedAt: Date.now() })).toString("base64url");
    const signature = createHmac("sha256", process.env.AUTH_SECRET || "development-only-calendar-key").update(payload).digest("base64url");
    return `${payload}.${signature}`;
}

export function verifyOAuthState(value: string) {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", process.env.AUTH_SECRET || "development-only-calendar-key").update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    try {
        const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { organizationId?: string; issuedAt?: number };
        if (!parsed.organizationId || !parsed.issuedAt || Date.now() - parsed.issuedAt > 10 * 60_000) return null;
        return parsed;
    } catch { return null; }
}