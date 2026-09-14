import { prisma } from '../../lib/prisma';

export const authRepository = {
  findByPhone: (phone: string) => prisma.user.findUnique({ where: { phone } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  createUser: (data: { phone: string; email?: string; passwordHash: string; role: any }) =>
    prisma.user.create({ data }),
  createRefreshToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } }),
  findRefreshToken: (tokenHash: string) =>
    prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } }),
  revokeRefreshToken: (id: string) => prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
  revokeAllUserTokens: (userId: string) =>
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
};
