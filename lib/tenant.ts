import { cookies } from "next/headers";
import { getUserFromSession } from "./auth";

export async function getCurrentTenant() {
    const token = (await cookies()).get("smallbean_session")?.value;
    const user = await getUserFromSession(token);
    if (!user) return null;
    if (!process.env.DATABASE_URL) return { user, organizationId: "demo-sample-studio", role: "OWNER" as const };
    const { prisma } = await import("./database");
    const membership = await prisma.organizationMember.findFirst({ where: { userId: user.id }, select: { organizationId: true, role: true } });
    return membership ? { user, organizationId: membership.organizationId, role: membership.role } : null;
}