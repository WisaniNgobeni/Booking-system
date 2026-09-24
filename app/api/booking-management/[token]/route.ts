import { NextResponse } from "next/server";
import { getAvailableSlots, getDevelopmentBooking, parseBookingDateTime, updateDevelopmentBooking } from "../../../../lib/booking";
import { rateLimit, requestAddress } from "../../../../lib/security";

type Context = { params: Promise<{ token: string }> };

export async function GET(_: Request, context: Context) {
    const limited = await rateLimit(`manage:${requestAddress(_)}`, 30, 60 * 60_000);
    if (limited) return limited;
    const { token } = await context.params;
    if (!process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Booking service is not configured." }, { status: 503 });
        const booking = getDevelopmentBooking(token);
        return booking ? NextResponse.json({ booking }) : NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    const { prisma } = await import("../../../../lib/database");
    const booking = await prisma.appointment.findUnique({ where: { manageTokenHash: (await import("node:crypto")).createHash("sha256").update(token).digest("hex") }, include: { customer: true, service: true, organization: true } });
    return booking ? NextResponse.json({ booking }) : NextResponse.json({ error: "Booking not found." }, { status: 404 });
}

export async function PATCH(request: Request, context: Context) {
    const limited = await rateLimit(`manage:${requestAddress(request)}`, 15, 60 * 60_000);
    if (limited) return limited;
    const { token } = await context.params;
    const body = await request.json();
    if (!body || !["CANCELLED", "RESCHEDULED"].includes(body.action)) return NextResponse.json({ error: "Invalid booking action." }, { status: 400 });
    if (!process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Booking service is not configured." }, { status: 503 });
        return updateDevelopmentBooking(token, body.action, body.date, body.time) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    const { prisma } = await import("../../../../lib/database");
    const crypto = await import("node:crypto");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const booking = await prisma.appointment.findUnique({ where: { manageTokenHash: hash }, include: { service: true, organization: { include: { bookingSettings: true, workingHours: true, timeOff: true } } } });
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    const settings = booking.organization.bookingSettings;
    if (body.action === "CANCELLED") {
        if (settings && !settings.allowCustomerCancellation) return NextResponse.json({ error: "Customer cancellation is disabled." }, { status: 403 });
        if (settings && booking.startsAt.getTime() - Date.now() < settings.cancellationDeadlineMinutes * 60_000) return NextResponse.json({ error: "This appointment is inside the cancellation window." }, { status: 409 });
        await prisma.appointment.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    } else if (typeof body.date === "string" && typeof body.time === "string") {
        if (settings && !settings.allowCustomerRescheduling) return NextResponse.json({ error: "Customer rescheduling is disabled." }, { status: 403 });
        const startsAt = parseBookingDateTime(body.date, body.time);
        if (settings && startsAt.getTime() < Date.now() + settings.minNoticeMinutes * 60_000) return NextResponse.json({ error: "This time is too soon to book." }, { status: 409 });
        if (settings && startsAt.getTime() > Date.now() + settings.maxAdvanceDays * 24 * 60 * 60_000) return NextResponse.json({ error: "This date is too far in advance." }, { status: 409 });
        const weekday = startsAt.getUTCDay();
        const periods = booking.organization.workingHours.filter((item) => item.staffId === null && item.weekday === weekday).map((item) => ({ start: `${String(Math.floor(item.startMinutes / 60)).padStart(2, "0")}:${String(item.startMinutes % 60).padStart(2, "0")}`, end: `${String(item.endMinutes / 60).padStart(2, "0")}:${String(item.endMinutes % 60).padStart(2, "0")}` }));
        const endsAt = new Date(startsAt.getTime() + (booking.service.durationMinutes + booking.service.bufferMinutes) * 60_000);
        const unavailable = booking.organization.timeOff.some((item) => item.staffId === null && item.startsAt < endsAt && item.endsAt > startsAt);
        if (unavailable || !getAvailableSlots(periods, booking.service.durationMinutes, booking.service.bufferMinutes, [], 30).includes(body.time)) return NextResponse.json({ error: "That time is outside the available hours." }, { status: 409 });
        const conflict = await prisma.appointment.findFirst({ where: { id: { not: booking.id }, organizationId: booking.organizationId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt }, status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] } } });
        if (conflict) return NextResponse.json({ error: "That time is no longer available." }, { status: 409 });
        await prisma.appointment.update({ where: { id: booking.id }, data: { startsAt, endsAt, status: "CONFIRMED" } });
    } else return NextResponse.json({ error: "A valid date and time are required." }, { status: 400 });
    return NextResponse.json({ ok: true });
}