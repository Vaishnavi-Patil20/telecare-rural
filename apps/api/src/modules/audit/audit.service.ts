import { prisma } from '../../lib/prisma';

export const auditService = {
  log(actorId: string | null, action: string, entity: string, entityId?: string, metadata?: any) {
    return prisma.auditLog.create({ data: { actorId, action, entity, entityId, metadata } });
  },
};
