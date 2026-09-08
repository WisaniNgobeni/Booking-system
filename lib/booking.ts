import { createHash, randomBytes } from "node:crypto";

export type WorkingPeriod = { start: string; end: string };
export type ExistingBooking = { start: string; durationMinutes: number; bufferMinutes: number };

const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export function getAvailableSlots(periods: WorkingPeriod[], durationMinutes: number, bufferMinutes: number, existing: ExistingBooking[], stepMinutes = 30) {
    if (durationMinutes <= 0 || stepMinutes <= 0) return [];
    const occupied = existing.map((booking) => {
        const start = toMinutes(booking.start);
        return [start, start + booking.durationMinutes + booking.bufferMinutes] as const;
    });
    const slots: string[] = [];
    for (const period of periods) {
        const periodStart = toMinutes(period.start);
        const periodEnd = toMinutes(period.end);
        for (let start = periodStart; start + durationMinutes + bufferMinutes <= periodEnd; start += stepMinutes) {
            const end = start + durationMinutes + bufferMinutes;
            if (!occupied.some(([bookedStart, bookedEnd]) => start < bookedEnd && end > bookedStart)) slots.push(toTime(start));
        }
    }
    return slots;
}

export type BookingInput = { businessSlug: string; service: string; date: string; time: string; name: string; email: string; phone: string };
export type StoredBooking = BookingInput & { id: string; createdAt: string; status: "CONFIRMED" | "CANCELLED"; manageToken: string };
const bookings: StoredBooking[] = [];
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function parseBookingDateTime(date: string, time: string) {
    if (!datePattern.test(date) || !timePattern.test(time)) throw new Error("Choose a valid date and time.");
    const value = new Date(`${date}T${time}:00.000Z`);
    if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 16) !== `${date}T${time}`) throw new Error("Choose a valid date and time.");
    return value;
}

export function validateBooking(input: unknown): BookingInput {
    if (!input || typeof input !== "object") throw new Error("Booking details are required.");
    const value = input as Record<string, unknown>;
    const fields = ["businessSlug", "service", "date", "time", "name", "email", "phone"] as const;
    for (const field of fields) if (typeof value[field] !== "string" || !value[field]?.trim()) throw new Error(`${field} is required.`);
    const normalized = Object.fromEntries(fields.map((field) => [field, (value[field] as string).trim()])) as BookingInput;
    if (!/^\S+@\S+\.\S+$/.test(normalized.email)) throw new Error("Enter a valid email address.");
    if (normalized.name.length > 120 || normalized.email.length > 254 || normalized.phone.length > 40 || normalized.businessSlug.length > 120 || normalized.service.length > 160) throw new Error("Some booking details are too long.");
    parseBookingDateTime(normalized.date, normalized.time);
    return normalized;
}

export function createBooking(input: BookingInput) {
    const duplicate = bookings.some((booking) => booking.businessSlug === input.businessSlug && booking.date === input.date && booking.time === input.time);
    if (duplicate) throw new Error("That time was just booked. Please choose another slot.");
    const manageToken = randomBytes(32).toString("base64url");
    const booking: StoredBooking = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "CONFIRMED", manageToken };
    bookings.push(booking);
    return booking;
}

export function listBookings(businessSlug: string) { return bookings.filter((booking) => booking.businessSlug === businessSlug); }

export function getDevelopmentBooking(token: string) { return bookings.find((booking) => booking.manageToken === token) ?? null; }
export function updateDevelopmentBooking(token: string, status: "CANCELLED" | "RESCHEDULED", date?: string, time?: string) {
    const booking = getDevelopmentBooking(token);
    if (!booking) return null;
    booking.status = status === "RESCHEDULED" ? "CONFIRMED" : status;
    if (date) booking.date = date;
    if (time) booking.time = time;
    return booking;
}

export async function createPersistentBooking(input: BookingInput) {
    if (!process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === "production") throw new Error("Persistent storage is not configured.");
        const booking = createBooking(input);
        return { booking, manageToken: booking.manageToken };
    }
    const { prisma } = await import("./database");
    const organization = await prisma.organization.findUnique({ where: { slug: input.businessSlug }, include: { services: true, workingHours: true, timeOff: true, bookingSettings: true } });
    if (!organization) throw new Error("Business not found.");
    const service = organization.services.find((item) => item.name === input.service && item.active && !item.deletedAt);
    if (!service) throw new Error("Service is no longer available.");
    const startsAt = parseBookingDateTime(input.date, input.time);
    const settings = organization.bookingSettings;
    const now = new Date();
    if (settings && startsAt.getTime() < now.getTime() + settings.minNoticeMinutes * 60_000) throw new Error("This time is too soon to book.");
    if (settings && startsAt.getTime() > now.getTime() + settings.maxAdvanceDays * 24 * 60 * 60_000) throw new Error("This date is too far in advance.");
    const weekday = startsAt.getUTCDay();
    const periods = organization.workingHours.filter((item) => item.staffId === null && item.weekday === weekday).map((item) => ({ start: `${String(Math.floor(item.startMinutes / 60)).padStart(2, "0")}:${String(item.startMinutes % 60).padStart(2, "0")}`, end: `${String(Math.floor(item.endMinutes / 60)).padStart(2, "0")}:${String(item.endMinutes % 60).padStart(2, "0")}` }));
    const unavailable = organization.timeOff.some((item) => item.staffId === null && item.startsAt < new Date(startsAt.getTime() + (service.durationMinutes + service.bufferMinutes) * 60_000) && item.endsAt > startsAt);
    if (unavailable || !getAvailableSlots(periods, service.durationMinutes, service.bufferMinutes, [], 30).includes(input.time)) throw new Error("That time is outside the available hours.");
    const endsAt = new Date(startsAt.getTime() + (service.durationMinutes + service.bufferMinutes) * 60_000);
    return prisma.$transaction(async (transaction) => {
        const conflict = await transaction.appointment.findFirst({ where: { organizationId: organization.id, startsAt: { lt: endsAt }, endsAt: { gt: startsAt }, status: { in: ["PENDING", "CONFIRMED"] } } });
        if (conflict) throw new Error("That time was just booked. Please choose another slot.");
        const customer = await transaction.customer.upsert({ where: { organizationId_email: { organizationId: organization.id, email: input.email } }, update: { name: input.name, phone: input.phone }, create: { organizationId: organization.id, name: input.name, email: input.email, phone: input.phone } });
        const manageToken = randomBytes(32).toString("base64url");
        const appointment = await transaction.appointment.create({ data: { organizationId: organization.id, customerId: customer.id, serviceId: service.id, startsAt, endsAt, status: "CONFIRMED", manageTokenHash: tokenHash(manageToken) } });
        await transaction.notification.create({ data: { organizationId: organization.id, appointmentId: appointment.id, channel: "email", type: "BOOKING_CONFIRMATION", recipient: input.email, status: "QUEUED", scheduledFor: new Date() } });
        return { booking: appointment, manageToken };
    }, { isolationLevel: "Serializable" });
}