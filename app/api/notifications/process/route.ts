import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    if (!process.env.EMAIL_PROVIDER_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const notifications = await prisma.notification.findMany({ where: { status: "QUEUED", channel: "email", scheduledFor: { lte: new Date() } }, orderBy: { scheduledFor: "asc" }, take: 20 });
    let sent = 0;
    for (const notification of notifications) {
        const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.EMAIL_PROVIDER_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: notification.recipient, subject: "Your Smallbean booking is confirmed", html: "<p>Your appointment has been confirmed. Please keep your booking link safe if you need to manage it.</p>" }) });
        if (response.ok) { await prisma.notification.update({ where: { id: notification.id }, data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 } } }); sent += 1; }
        else await prisma.notification.update({ where: { id: notification.id }, data: { status: "FAILED", attempts: { increment: 1 }, lastError: `Email provider returned ${response.status}` } });
    }
    return NextResponse.json({ processed: notifications.length, sent });
}