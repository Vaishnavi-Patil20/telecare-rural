import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { appointmentService } from './appointment.service';
import { appointmentRepository } from './appointment.repository';
import { Role } from '@prisma/client';

export const appointmentRouter = Router();
appointmentRouter.use(requireAuth);

const bookSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime({ offset: true }),
  familyMemberId: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
  symptoms: z.string().max(2000).optional(),
  type: z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']).optional(),
});

appointmentRouter.post('/', requireRole(Role.PATIENT, Role.HEALTH_WORKER), validate(bookSchema),
  async (req, res, next) => {
    try { res.status(201).json(await appointmentService.book(req.user!.userId, req.body)); } catch (e) { next(e); }
  });

appointmentRouter.get('/mine', async (req, res, next) => {
  try { res.json(await appointmentRepository.listForPatient(req.user!.userId)); } catch (e) { next(e); }
});

appointmentRouter.patch('/:id/status', validate(z.object({ status: z.enum(['CONFIRMED','CANCELLED','COMPLETED','NO_SHOW']) })),
  async (req, res, next) => {
    try { res.json(await appointmentService.setStatus(req.params.id, req.body.status, req.user!)); } catch (e) { next(e); }
  });
