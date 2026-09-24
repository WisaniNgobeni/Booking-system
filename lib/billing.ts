import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const priceIds: Record<"PRO" | "BUSINESS", string | undefined> = {
    PRO: process.env.STRIPE_PRICE_PRO,
    BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export type BillingPlan = "FREE" | "PRO" | "BUSINESS";

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

export function appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
