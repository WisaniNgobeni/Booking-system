import test from "node:test";
import assert from "node:assert/strict";

test("availability excludes appointments and buffer time", async () => {
    const { getAvailableSlots } = await import("../lib/booking.ts");
    assert.deepEqual(getAvailableSlots([{ start: "09:00", end: "13:00" }], 60, 15, [{ start: "10:00", durationMinutes: 60, bufferMinutes: 15 }]), ["11:30"]);
});

test("booking validation rejects malformed dates and oversized contact details", async () => {
    const { validateBooking } = await import("../lib/booking.ts");
    assert.throws(() => validateBooking({ businessSlug: "studio", service: "Cut", date: "2026-02-30", time: "09:00", name: "A", email: "a@example.com", phone: "1" }), /valid date and time/);
    assert.throws(() => validateBooking({ businessSlug: "studio", service: "Cut", date: "2026-09-10", time: "09:00", name: "A".repeat(121), email: "a@example.com", phone: "1" }), /too long/);
});

test("security rate limit blocks requests after the configured threshold", async () => {
    const { checkRateLimit } = await import("../lib/rate-limit.ts");
    const key = `test-${Date.now()}`;
    assert.equal(await checkRateLimit(key, 1, 60_000), null);
    assert.ok((await checkRateLimit(key, 1, 60_000) ?? 0) >= 59);
});