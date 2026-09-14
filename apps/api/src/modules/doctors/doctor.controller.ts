import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { doctorService } from './doctor.service';
import { Role } from '@prisma/client';

export const doctorRouter = Router();

doctorRouter.get('/', async (req, res, next) => {
  try { res.json(await doctorService.search(req.query)); } catch (e) { next(e); }
});

doctorRouter.get('/:id', async (req, res, next) => {
  try { res.json(await doctorService.getProfile(req.params.id)); } catch (e) { next(e); }
});

doctorRouter.get('/:id/slots', async (req, res, next) => {
  try { res.json({ slots: await doctorService.availableSlots(req.params.id, String(req.query.date)) }); } catch (e) { next(e); }
});

const availabilitySchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotMinutes: z.number().int().min(5).max(120).default(15),
  })).max(100),
});

doctorRouter.put('/me/availability', requireAuth, requireRole(Role.DOCTOR),
  validate(availabilitySchema), async (req, res, next) => {
    try { res.json(await doctorService.setAvailability(req.user!.userId, req.body.slots)); } catch (e) { next(e); }
  });
