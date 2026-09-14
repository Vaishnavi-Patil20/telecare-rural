import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { adminService } from './admin.service';
import { Role } from '@prisma/client';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

adminRouter.get('/stats', async (_req, res, next) => {
  try { res.json(await adminService.stats()); } catch (e) { next(e); }
});

adminRouter.get('/users', async (req, res, next) => {
  try { res.json(await adminService.listUsers(req.query)); } catch (e) { next(e); }
});

adminRouter.patch('/users/:id/status', validate(z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
})), async (req, res, next) => {
  try { res.json(await adminService.setUserStatus(req.user!.userId, req.params.id, req.body.status)); } catch (e) { next(e); }
});

adminRouter.get('/doctors/pending', async (_req, res, next) => {
  try { res.json(await adminService.doctorsPending()); } catch (e) { next(e); }
});

adminRouter.post('/doctors/:id/verify', validate(z.object({
  approved: z.boolean(), reason: z.string().max(500).optional(),
})), async (req, res, next) => {
  try { res.json(await adminService.verifyDoctor(req.user!.userId, req.params.id, req.body.approved, req.body.reason)); } catch (e) { next(e); }
});
