import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Unauthorized, Forbidden } from '../lib/errors';
import { Role } from '@prisma/client';

export interface AuthUser { userId: string; role: Role; }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(Unauthorized());
  try {
    const payload = jwt.verify(header.slice(7), env.jwtAccessSecret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(Unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) return next(Forbidden());
    next();
  };
}
