import crypto from "node:crypto";
import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const priceIds: Record<"PRO" | "BUSINESS", string | undefined> = {
    PRO: process.env.STRIPE_PRICE_PRO,
    BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export type BillingPlan = "FREE" | "PRO" | "BUSINESS";

export const planPricing: Record<Exclude<BillingPlan, "FREE">, { amount: number; label: string }> = {
    PRO: { amount: 249, label: "Pro" },
    BUSINESS: { amount: 499, label: "Business" },
};

export function payfastConfig() {
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASS_PHRASE;
    const sandbox = process.env.PAYFAST_MODE === "sandbox" || process.env.PAYFAST_SANDBOX === "true";
    const enabled = Boolean(merchantId && merchantKey && passphrase);
    return {
        enabled,
        sandbox,
        merchantId,
        merchantKey,
        passphrase,
        processUrl: sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process",
        notifyUrl: process.env.PAYFAST_NOTIFY_URL || `${appUrl()}/api/billing/webhook`,
        returnUrl: process.env.PAYFAST_RETURN_URL || `${appUrl()}/dashboard/profile?billing=success`,
        cancelUrl: process.env.PAYFAST_CANCEL_URL || `${appUrl()}/dashboard/profile?billing=cancelled`,
    };
}

export function amountForPlan(plan: string) {
    const normalized = plan.toUpperCase();
    if (normalized === "PRO") return planPricing.PRO.amount;
    if (normalized === "BUSINESS") return planPricing.BUSINESS.amount;
    throw new Error("That billing plan is not available for checkout.");
}

export function planForPriceId(priceId: string | null | undefined): Exclude<BillingPlan, "FREE"> {
    if (priceId && priceId === priceIds.PRO) return "PRO";
    if (priceId && priceId === priceIds.BUSINESS) return "BUSINESS";
    throw new Error("Stripe price is not configured for an application plan.");
}

export function priceIdForPlan(plan: string) {
    const normalized = plan.toUpperCase();
    if (normalized !== "PRO" && normalized !== "BUSINESS") throw new Error("That billing plan is not available for checkout.");
    const priceId = priceIds[normalized];
    if (!priceId) throw new Error("That billing plan is not configured.");
    return priceId;
}

export function canStartCheckout(status: string | null | undefined) {
    return !status || !["ACTIVE", "TRIALING", "INCOMPLETE", "PAST_DUE"].includes(status);
}

export function shouldApplySubscriptionEvent(lastEventCreatedAt: Date | null | undefined, incomingEventCreatedAt: Date) {
    return !lastEventCreatedAt || lastEventCreatedAt < incomingEventCreatedAt;
}

export function subscriptionStatus(status: Stripe.Subscription.Status) {
    if (status === "active") return "ACTIVE" as const;
    if (status === "trialing") return "TRIALING" as const;
    if (status === "past_due" || status === "unpaid") return "PAST_DUE" as const;
    if (status === "incomplete") return "INCOMPLETE" as const;
    if (status === "canceled" || status === "incomplete_expired") return "CANCELED" as const;
    throw new Error(`Unsupported Stripe subscription status: ${status}`);
}

export function subscriptionSnapshot(subscription: Stripe.Subscription) {
    const item = subscription.items.data[0];
    if (!item) throw new Error("Stripe subscription has no price item.");
    const priceId = typeof item.price === "string" ? item.price : item.price.id;
    const plan = planForPriceId(priceId);
    const price = typeof item.price === "string" ? null : item.price;
    const product = price?.product;
    const productId = typeof product === "string" ? product : product && "id" in product ? product.id : undefined;
    return { plan, providerPriceId: priceId, providerProductId: productId, status: subscriptionStatus(subscription.status), currency: price?.currency?.toUpperCase(), currentPeriodStart: new Date(item.current_period_start * 1000), currentPeriodEnd: new Date(item.current_period_end * 1000), cancelAtPeriodEnd: subscription.cancel_at_period_end, canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null, trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null };
}

export function generatePayFastSignature(payload: Record<string, string | number | null | undefined>, passphrase?: string) {
    const entries = Object.entries(payload)
        .filter(([, value]) => value !== undefined && value !== null && `${value}`.length > 0 && value !== "signature")
        .sort(([left], [right]) => left.localeCompare(right));
    const data = entries.map(([key, value]) => `${key}=${encodeURIComponent(String(value)).replace(/%20/g, "+")}`).join("&");
    const prepared = passphrase ? `${data}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}` : data;
    return crypto.createHash("md5").update(prepared).digest("hex");
}

export function verifyPayFastSignature(payload: Record<string, string | number | null | undefined>, passphrase?: string) {
    const signature = typeof payload.signature === "string" ? payload.signature : "";
    if (!signature) return false;
    const expected = generatePayFastSignature(payload, passphrase);
    if (expected.length !== signature.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
    } catch {
        return false;
    }
}

export function createPayFastCheckout({ organizationId, plan, email, name, returnUrl, cancelUrl, notifyUrl }: { organizationId: string; plan: "PRO" | "BUSINESS"; email?: string; name?: string; returnUrl?: string; cancelUrl?: string; notifyUrl?: string }) {
    const config = payfastConfig();
    if (!config.enabled) throw new Error("PayFast is not configured.");
    const amount = amountForPlan(plan).toFixed(2);
    const paymentId = `${organizationId}:${plan}:${Date.now()}`;
    const payload: Record<string, string | number> = {
        merchant_id: config.merchantId!,
        merchant_key: config.merchantKey!,
        return_url: returnUrl || config.returnUrl,
        cancel_url: cancelUrl || config.cancelUrl,
        notify_url: notifyUrl || config.notifyUrl,
        m_payment_id: paymentId,
        amount,
        item_name: `Smallbean ${plan} monthly subscription`,
        item_description: `Smallbean ${plan} monthly subscription for ${organizationId}`,
        email_address: email || "",
        custom_str1: organizationId,
        custom_str2: plan,
        subscription_type: 1,
        billing_date: new Date().toISOString().slice(0, 10),
        name_first: name?.split(" ")[0] || "Smallbean",
        name_last: name?.split(" ").slice(1).join(" ") || "Customer",
        email_confirmation: 1,
    };
    const signature = generatePayFastSignature(payload, config.passphrase);
    return { url: config.processUrl, payload: { ...payload, signature } };
}

export function appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
