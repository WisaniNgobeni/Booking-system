import type { SubscriptionStatus } from "../generated/prisma/client";

export type ApplicationPlan = "FREE" | "PRO" | "BUSINESS";
export type PlanFeature = "analytics" | "calendar" | "team";

const rank: Record<ApplicationPlan, number> = { FREE: 0, PRO: 1, BUSINESS: 2 };
const minimumPlan: Record<PlanFeature, ApplicationPlan> = { analytics: "PRO", calendar: "PRO", team: "BUSINESS" };

export function normalizedPlan(plan: string | null | undefined): ApplicationPlan {
    if (plan === "PRO" || plan === "BUSINESS") return plan;
    return "FREE";
}

export function subscriptionAllows(status: SubscriptionStatus, currentPeriodEnd?: Date | null) {
    if (status === "CANCELED" || status === "INCOMPLETE") return false;
    if (status === "PAST_DUE" && currentPeriodEnd && currentPeriodEnd < new Date()) return false;
    return true;
}

export function canUseFeature(plan: string | null | undefined, status: SubscriptionStatus, feature: PlanFeature, currentPeriodEnd?: Date | null) {
    const applicationPlan = normalizedPlan(plan);
    return subscriptionAllows(status, currentPeriodEnd) && rank[applicationPlan] >= rank[minimumPlan[feature]];
}

export function planDetails() {
    return [
        { plan: "FREE" as const, name: "Free", priceZar: 0, description: "A simple booking presence for getting started." },
        { plan: "PRO" as const, name: "Pro", priceZar: 299, description: "Analytics and calendar tools for growing businesses." },
        { plan: "BUSINESS" as const, name: "Business", priceZar: 599, description: "Team capabilities for established businesses." },
    ];
}
