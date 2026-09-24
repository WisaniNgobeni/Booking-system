import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../../../lib/tenant";
import { oauthConfig, oauthRedirect, signOAuthState } from "../../../../../lib/calendar";
import { canUseFeature } from "../../../../../lib/plan-access";

type Context = { params: Promise<{ provider: string }> };
export async function GET(_: Request, context: Context) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const { prisma } = await import("../../../../../lib/database");
    const subscription = await prisma.subscription.findUnique({ where: { organizationId: tenant.organizationId }, select: { plan: true, status: true, currentPeriodEnd: true } });
    if (!subscription || !canUseFeature(subscription.plan, subscription.status, "calendar", subscription.currentPeriodEnd)) return NextResponse.json({ error: "Calendar integration requires an active Pro or Business subscription." }, { status: 403 });
    const { provider } = await context.params;
    if (provider !== "google" && provider !== "microsoft") return NextResponse.json({ error: "Unsupported calendar provider." }, { status: 400 });
    const config = oauthConfig(provider);
    if (!config.clientId || !config.clientSecret) return NextResponse.json({ error: "Calendar provider is not configured." }, { status: 503 });
    const state = signOAuthState(tenant.organizationId);
    const url = new URL(config.authorize); url.searchParams.set("client_id", config.clientId); url.searchParams.set("redirect_uri", oauthRedirect(provider)); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", config.scope); url.searchParams.set("state", state); url.searchParams.set("access_type", "offline"); url.searchParams.set("prompt", "consent");
    return NextResponse.redirect(url);
}
