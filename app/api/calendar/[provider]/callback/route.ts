import { NextResponse } from "next/server";
import { encryptSecret, oauthConfig, oauthRedirect, verifyOAuthState } from "../../../../../lib/calendar";
import { prisma } from "../../../../../lib/database";

type Context = { params: Promise<{ provider: string }> };
export async function GET(request: Request, context: Context) {
    const { provider } = await context.params;
    if (provider !== "google" && provider !== "microsoft") return NextResponse.json({ error: "Unsupported calendar provider." }, { status: 400 });
    const params = new URL(request.url).searchParams; const code = params.get("code"); const stateValue = params.get("state");
    if (!code || !stateValue) return NextResponse.json({ error: "Calendar authorization was incomplete." }, { status: 400 });
    const state = verifyOAuthState(stateValue);
    if (!state?.organizationId) return NextResponse.json({ error: "Invalid or expired calendar authorization state." }, { status: 400 });
    const config = oauthConfig(provider);
    if (!config.clientId || !config.clientSecret) return NextResponse.json({ error: "Calendar provider is not configured." }, { status: 503 });
    const response = await fetch(config.token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: oauthRedirect(provider), grant_type: "authorization_code" }) });
    if (!response.ok) return NextResponse.json({ error: "Calendar authorization failed." }, { status: 400 });
    const token = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number; id_token?: string };
    if (!token.access_token || !token.refresh_token) return NextResponse.json({ error: "Calendar provider did not return the required tokens." }, { status: 400 });
    const providerAccountId = token.id_token || `${provider}:${state.organizationId}`;
    await prisma.calendarAccount.upsert({ where: { organizationId_provider: { organizationId: state.organizationId, provider } }, update: { providerAccountId, accessToken: encryptSecret(token.access_token), refreshToken: encryptSecret(token.refresh_token), expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null }, create: { organizationId: state.organizationId, provider, providerAccountId, accessToken: encryptSecret(token.access_token), refreshToken: encryptSecret(token.refresh_token), expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null } });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/profile?calendar=${provider}-connected`);
}
