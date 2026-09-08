import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type User = { id: string; name: string; email: string; passwordHash: string };
type Session = { userId: string; expiresAt: number };

const users = new Map<string, User>();
const sessions = new Map<string, Session>();

function digest(value: string) {
    const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("AUTH_SECRET must be configured in production."); })() : "development-only-change-me");
    return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}
function createToken() { return randomBytes(32).toString("base64url"); }
function expiresAt() { return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); }

async function createSession(userId: string) {
    const token = createToken();
    const expiry = expiresAt();
    if (process.env.DATABASE_URL) {
        const { prisma } = await import("./database");
        await prisma.session.create({ data: { tokenHash: digest(token), userId, expiresAt: expiry } });
    } else {
        sessions.set(token, { userId, expiresAt: expiry.getTime() });
    }
    return token;
}

export function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
    const expected = scryptSync(password, salt, 64);
    const actual = Buffer.from(hash, "hex");
    return actual.length === expected.length && timingSafeEqual(expected, actual);
}

export async function registerUser(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("Enter a valid name and email address.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") throw new Error("Persistent storage is not configured.");
    if (users.has(normalizedEmail)) throw new Error("Unable to create account with those details.");
    const user = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash: hashPassword(password) };
    if (process.env.DATABASE_URL) {
        const { prisma } = await import("./database");
        const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
        const slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
        const created = await prisma.$transaction(async (transaction) => {
            const persisted = await transaction.user.create({ data: { name: user.name, email: user.email, passwordHash: user.passwordHash } });
            const organization = await transaction.organization.create({ data: { name: `${user.name}'s business`, slug, email: user.email, members: { create: { userId: persisted.id, role: "OWNER" } }, bookingSettings: { create: {} }, subscription: { create: { plan: "FREE" } } } });
            return { id: persisted.id, name: persisted.name, email: persisted.email, organizationId: organization.id };
        });
        return created;
    }
    users.set(normalizedEmail, user);
    return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(email: string, password: string) {
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") throw new Error("Persistent storage is not configured.");
    const user = users.get(email.trim().toLowerCase());
    if (process.env.DATABASE_URL) {
        const { prisma } = await import("./database");
        const persisted = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!persisted || !verifyPassword(password, persisted.passwordHash)) throw new Error("Invalid email or password.");
        return createSession(persisted.id);
    }
    if (!user || !verifyPassword(password, user.passwordHash)) throw new Error("Invalid email or password.");
    return createSession(user.id);
}

export async function getUserFromSession(token: string | undefined) {
    if (!token) return null;
    if (process.env.DATABASE_URL) {
        const { prisma } = await import("./database");
        const session = await prisma.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: true } });
        if (!session) return null;
        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { tokenHash: session.tokenHash } });
            return null;
        }
        return session.user;
    }
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) { sessions.delete(token); return null; }
    const memoryUser = [...users.values()].find((user) => user.id === session.userId) ?? null;
    return memoryUser;
}

export async function destroySession(token: string | undefined) {
    if (!token) return;
    if (process.env.DATABASE_URL) {
        const { prisma } = await import("./database");
        await prisma.session.deleteMany({ where: { tokenHash: digest(token) } });
        return;
    }
    sessions.delete(token);
}