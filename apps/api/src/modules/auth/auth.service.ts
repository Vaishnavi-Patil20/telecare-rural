import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import { Unauthorized, Conflict, BadRequest } from '../../lib/errors';

const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
const signAccess = (userId: string, role: Role) =>
  jwt.sign({ userId, role }, env.jwtAccessSecret, { expiresIn: env.accessTtl as any });

export const authService = {
  async signup(input: { phone: string; email?: string; password: string; role?: Role }) {
    const existing = await authRepository.findByPhone(input.phone);
    if (existing) throw Conflict('An account with this phone number already exists');
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await authRepository.createUser({
      phone: input.phone, email: input.email, passwordHash,
      role: input.role ?? Role.PATIENT,
    });
    return this.issueTokens(user.id, user.role);
  },

  async login(phone: string, password: string) {
    const user = await authRepository.findByPhone(phone);
    if (!user || user.status !== 'ACTIVE') throw Unauthorized('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw Unauthorized('Invalid credentials');
    return this.issueTokens(user.id, user.role);
  },

  async refresh(refreshToken: string) {
    const record = await authRepository.findRefreshToken(hashToken(refreshToken));
    if (!record || record.revokedAt || record.expiresAt < new Date()) throw Unauthorized('Invalid refresh token');
    await authRepository.revokeRefreshToken(record.id); // rotation
    return this.issueTokens(record.userId, record.user.role);
  },

  async logout(refreshToken: string) {
    const record = await authRepository.findRefreshToken(hashToken(refreshToken));
    if (record) await authRepository.revokeRefreshToken(record.id);
  },

  async issueTokens(userId: string, role: Role) {
    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + env.refreshTtlDays * 86400_000);
    await authRepository.createRefreshToken(userId, hashToken(refreshToken), expiresAt);
    return { accessToken: signAccess(userId, role), refreshToken };
  },
};
