import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Persistent storage is required." }, { status: 503 });
    if (!process.env.EMAIL_PROVIDER_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
    const { prisma } = await import("../../../../lib/database");
    const staleClaim = new Date(Date.now() - 15 * 60_000);
    await prisma.notification.updateMany({ where: { status: "PROCESSING", claimedAt: { lt: staleClaim } }, data: { status: "QUEUED", claimedAt: null } });
    const notifications = await prisma.notification.findMany({ where: { status: "QUEUED", channel: "email", scheduledFor: { lte: new Date() } }, orderBy: { scheduledFor: "asc" }, take: 20 });
    let sent = 0;
    for (const notification of notifications) {
        const claimed = await prisma.notification.updateMany({ where: { id: notification.id, status: "QUEUED" }, data: { status: "PROCESSING", claimedAt: new Date(), attempts: { increment: 1 } } });
        if (!claimed.count) continue;
        const metadata = notification.metadata && typeof notification.metadata === "object" && !Array.isArray(notification.metadata) ? notification.metadata as { token?: string } : {};
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const accountLink = metadata.token ? `${appUrl}/${notification.type === "EMAIL_VERIFICATION" ? "auth/verify" : "auth/reset-password"}?token=${encodeURIComponent(metadata.token)}` : "";
        const subject = notification.type === "EMAIL_VERIFICATION" ? "Verify your Smallbean email" : notification.type === "PASSWORD_RESET" ? "Reset your Smallbean password" : "Your Smallbean booking is confirmed";
        const html = accountLink ? `<p><a href="${accountLink}">${notification.type === "EMAIL_VERIFICATION" ? "Verify your email address" : "Reset your password"}</a></p>` : "<p>Your appointment has been confirmed. Please keep your booking link safe if you need to manage it.</p>";
        const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.EMAIL_PROVIDER_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: notification.recipient, subject, html }) });
        if (response.ok) { await prisma.notification.update({ where: { id: notification.id }, data: { status: "SENT", sentAt: new Date(), claimedAt: null } }); sent += 1; }
        else {
            const attempts = notification.attempts + 1;
            const permanent = attempts >= 5;
            await prisma.notification.update({ where: { id: notification.id }, data: { status: permanent ? "FAILED" : "QUEUED", claimedAt: null, scheduledFor: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000), lastError: `Email provider returned ${response.status}` } });
        }
    }
    return NextResponse.json({ processed: notifications.length, sent });
}