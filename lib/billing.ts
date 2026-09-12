import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const priceIds: Record<string, string | undefined> = {
    PRO: process.env.STRIPE_PRICE_PRO,
    BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export function priceIdForPlan(plan: string) {
    const priceId = priceIds[plan.toUpperCase()];
    if (!priceId) throw new Error("That billing plan is not configured.");
    return priceId;
}

export function subscriptionStatus(status: Stripe.Subscription.Status) {
    if (status === "active") return "ACTIVE" as const;
    if (status === "past_due" || status === "unpaid") return "PAST_DUE" as const;
    if (status === "canceled" || status === "incomplete_expired") return "CANCELED" as const;
    return "TRIALING" as const;
}

export function appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
