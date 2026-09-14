import { prisma } from '../../lib/prisma';
import { NotificationType } from '@prisma/client';

export const notificationService = {
  async notify(userId: string, type: NotificationType, title: string, body?: string) {
    // In-app now; email/push adapters plug in here in Phase 5.
    return prisma.notification.create({ data: { userId, type, title, body } });
  },
};
