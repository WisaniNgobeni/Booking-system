import { NextResponse } from "next/server";
import { getAvailableSlots } from "../../../lib/booking";

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const slug = params.get("businessSlug");
    const serviceName = params.get("service");
    const date = params.get("date");
    if (!slug || !serviceName || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "businessSlug, service, and date are required." }, { status: 400 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Booking service is not configured." }, { status: 503 });
    const { prisma } = await import("../../../lib/database");
    const organization = await prisma.organization.findUnique({ where: { slug }, include: { services: true, workingHours: true, timeOff: true, appointments: true } });
    if (!organization) return NextResponse.json({ error: "Business not found." }, { status: 404 });
    const service = organization.services.find((item) => item.name === serviceName && item.active && !item.deletedAt);
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    const requestedDate = new Date(`${date}T00:00:00`);
    const day = requestedDate.getDay();
    const periods = organization.workingHours.filter((item) => item.staffId === null && item.weekday === day).map((item) => ({ start: `${String(Math.floor(item.startMinutes / 60)).padStart(2, "0")}:${String(item.startMinutes % 60).padStart(2, "0")}`, end: `${String(Math.floor(item.endMinutes / 60)).padStart(2, "0")}:${String(item.endMinutes % 60).padStart(2, "0")}` }));
    const unavailable = organization.timeOff.some((item) => item.staffId === null && item.startsAt < new Date(`${date}T23:59:59`) && item.endsAt > requestedDate);
    if (unavailable) return NextResponse.json({ slots: [] });
    const existing = organization.appointments.filter((item) => item.startsAt.toISOString().startsWith(date) && ["PENDING", "CONFIRMED"].includes(item.status)).map((item) => ({ start: item.startsAt.toISOString().slice(11, 16), durationMinutes: Math.max(1, Math.round((item.endsAt.getTime() - item.startsAt.getTime()) / 60_000)), bufferMinutes: 0 }));
    return NextResponse.json({ slots: getAvailableSlots(periods, service.durationMinutes, service.bufferMinutes, existing) });
}