import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authService } from './auth.service';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } },
});

const signupSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

authRouter.post('/signup', authLimiter, validate(signupSchema), async (req, res, next) => {
  try { res.status(201).json(await authService.signup(req.body)); } catch (e) { next(e); }
});

authRouter.post('/login', authLimiter, validate(signupSchema.pick({ phone: true, password: true })),
  async (req, res, next) => {
    try { res.json(await authService.login(req.body.phone, req.body.password)); } catch (e) { next(e); }
  });

authRouter.post('/refresh', async (req, res, next) => {
  try { res.json(await authService.refresh(req.body.refreshToken)); } catch (e) { next(e); }
});

authRouter.post('/logout', async (req, res, next) => {
  try { await authService.logout(req.body.refreshToken); res.json({ ok: true }); } catch (e) { next(e); }
});
