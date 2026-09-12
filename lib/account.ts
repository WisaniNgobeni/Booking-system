import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./database";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function issueAuthToken(userId: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const token = randomBytes(32).toString("base64url");
    await prisma.$transaction([
        prisma.authToken.deleteMany({ where: { userId, type } }),
        prisma.authToken.create({ data: { tokenHash: tokenHash(token), userId, type, expiresAt: new Date(Date.now() + (type === "EMAIL_VERIFICATION" ? 24 : 1) * 60 * 60 * 1000) } }),
    ]);
    return token;
}

export async function consumeAuthToken(token: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const record = await prisma.authToken.findFirst({ where: { tokenHash: tokenHash(token), type, usedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
    if (!record) return null;
    const consumed = await prisma.authToken.updateMany({ where: { tokenHash: record.tokenHash, usedAt: null }, data: { usedAt: new Date() } });
    return consumed.count ? record.user : null;
}

export async function queueAccountEmail(userId: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET", token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { memberships: { take: 1 } } });
    const membership = user?.memberships[0];
    if (!user || !membership) return;
    await prisma.notification.create({ data: { organizationId: membership.organizationId, channel: "email", type, recipient: user.email, status: "QUEUED", scheduledFor: new Date(), metadata: { token } } });
}