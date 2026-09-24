import type { Prisma, PrismaClient } from "../generated/prisma/client";

type AuditInput = {
    organizationId: string;
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
};

export async function writeAudit(prisma: PrismaClient, input: AuditInput) {
    await prisma.auditLog.create({
        data: {
            organizationId: input.organizationId,
            actorId: input.actorId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            metadata: input.metadata as Prisma.InputJsonObject | undefined,
        },
    });
}
