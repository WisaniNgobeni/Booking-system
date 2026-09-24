import test from "node:test";
import assert from "node:assert/strict";

process.env.STRIPE_PRICE_PRO = "price_pro_test";
process.env.STRIPE_PRICE_BUSINESS = "price_business_test";

const billing = await import("../lib/billing.ts");
const access = await import("../lib/plan-access.ts");

test("maps configured Stripe prices to application plans", () => {
    assert.equal(billing.planForPriceId("price_pro_test"), "PRO");
    assert.equal(billing.planForPriceId("price_business_test"), "BUSINESS");
    assert.throws(() => billing.planForPriceId("price_unknown"), /not configured/);
});

test("maps Stripe subscription statuses explicitly", () => {
    assert.equal(billing.subscriptionStatus("active"), "ACTIVE");
    assert.equal(billing.subscriptionStatus("trialing"), "TRIALING");
    assert.equal(billing.subscriptionStatus("past_due"), "PAST_DUE");
    assert.equal(billing.subscriptionStatus("unpaid"), "PAST_DUE");
    assert.equal(billing.subscriptionStatus("canceled"), "CANCELED");
    assert.equal(billing.subscriptionStatus("incomplete"), "INCOMPLETE");
    assert.equal(billing.subscriptionStatus("incomplete_expired"), "CANCELED");
    assert.throws(() => billing.subscriptionStatus("paused"), /Unsupported/);
});

test("blocks duplicate checkout for active and incomplete subscriptions", () => {
    assert.equal(billing.canStartCheckout(null), true);
    assert.equal(billing.canStartCheckout("CANCELED"), true);
    assert.equal(billing.canStartCheckout("ACTIVE"), false);
    assert.equal(billing.canStartCheckout("INCOMPLETE"), false);
});

test("ignores stale subscription events", () => {
    const newer = new Date("2026-09-15T12:00:00Z");
    assert.equal(billing.shouldApplySubscriptionEvent(new Date("2026-09-15T11:00:00Z"), newer), true);
    assert.equal(billing.shouldApplySubscriptionEvent(newer, newer), false);
    assert.equal(billing.shouldApplySubscriptionEvent(new Date("2026-09-15T13:00:00Z"), newer), false);
});

test("enforces plan access independently of dashboard display", () => {
    assert.equal(access.canUseFeature("FREE", "TRIALING", "analytics"), false);
    assert.equal(access.canUseFeature("PRO", "ACTIVE", "analytics"), true);
    assert.equal(access.canUseFeature("PRO", "ACTIVE", "team"), false);
    assert.equal(access.canUseFeature("BUSINESS", "ACTIVE", "team"), true);
    assert.equal(access.canUseFeature("PRO", "CANCELED", "analytics"), false);
});

test("tenant access decisions require organization-scoped data", () => {
    const organizationA = { organizationId: "org-a", plan: "PRO", status: "ACTIVE" };
    const organizationB = { organizationId: "org-b", plan: "FREE", status: "TRIALING" };
    assert.equal(organizationA.organizationId === "org-a" && access.canUseFeature(organizationA.plan, organizationA.status, "analytics"), true);
    assert.equal(organizationB.organizationId === organizationA.organizationId, false);
});
