import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ token: string }> };
const escapeIcs = (value: string) => value.replace(/[\\;,\n]/g, (character) => `\\${character === "\n" ? "n" : character}`);
const icsDate = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export async function GET(_: Request, context: Context) {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Calendar export is not configured." }, { status: 503 });
    const { token } = await context.params;
    const { prisma } = await import("../../../../../lib/database");
    const hash = createHash("sha256").update(token).digest("hex");
    const booking = await prisma.appointment.findUnique({ where: { manageTokenHash: hash }, include: { service: true, organization: true } });
    if (!booking || booking.status === "CANCELLED") return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Smallbean//Booking//EN", "BEGIN:VEVENT", `UID:${booking.id}@smallbean`, `DTSTAMP:${icsDate(booking.createdAt)}`, `DTSTART:${icsDate(booking.startsAt)}`, `DTEND:${icsDate(booking.endsAt)}`, `SUMMARY:${escapeIcs(booking.service.name)} at ${escapeIcs(booking.organization.name)}`, `DESCRIPTION:${escapeIcs(`Manage booking: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/booking/${token}`)}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
    return new NextResponse(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="smallbean-${booking.id}.ics"`, "Cache-Control": "private, no-store" } });
}
