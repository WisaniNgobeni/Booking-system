import { NextResponse } from "next/server";
import { getCurrentTenant } from "../../../lib/tenant";

export async function GET(request: Request) {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    const days = Math.min(365, Math.max(7, Number(new URL(request.url).searchParams.get("days")) || 30));
    const from = new Date(Date.now() - days * 24 * 60 * 60_000);
    const { prisma } = await import("../../../lib/database");
    const appointments = await prisma.appointment.findMany({ where: { organizationId: tenant.organizationId, startsAt: { gte: from } }, select: { status: true, service: { select: { name: true, price: true } } } });
    const completed = appointments.filter((item) => item.status === "COMPLETED");
    const cancellations = appointments.filter((item) => item.status === "CANCELLED").length;
    const revenue = completed.reduce((total, item) => total + Number(item.service.price), 0);
    const serviceCounts = new Map<string, number>();
    for (const appointment of appointments) serviceCounts.set(appointment.service.name, (serviceCounts.get(appointment.service.name) || 0) + 1);
    return NextResponse.json({ days, totals: { bookings: appointments.length, completed: completed.length, cancellations, revenue }, topServices: [...serviceCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5) });
}
