import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { profileService } from './profile.service';
import { Role } from '@prisma/client';

export const profileRouter = Router();
profileRouter.use(requireAuth, requireRole(Role.PATIENT));

const profileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(['MALE','FEMALE','OTHER']).optional(),
  address: z.string().max(300).optional(),
  villageId: z.string().uuid().optional(),
  emergencyContact: z.string().max(20).optional(),
  bloodGroup: z.string().max(5).optional(),
  allergies: z.string().max(1000).optional(),
  conditions: z.string().max(2000).optional(),
}).strict();

profileRouter.get('/me', async (req, res, next) => {
  try { res.json(await profileService.getMyProfile(req.user!.userId)); } catch (e) { next(e); }
});

profileRouter.put('/me', validate(profileSchema), async (req, res, next) => {
  try { res.json(await profileService.updateMyProfile(req.user!.userId, req.body)); } catch (e) { next(e); }
});

const familySchema = z.object({
  fullName: z.string().min(2).max(120),
  relation: z.string().min(2).max(40),
  dob: z.string().datetime().optional(),
  gender: z.enum(['MALE','FEMALE','OTHER']).optional(),
  notes: z.string().max(1000).optional(),
});

profileRouter.post('/family', validate(familySchema), async (req, res, next) => {
  try { res.status(201).json(await profileService.addFamilyMember(req.user!.userId, req.body)); } catch (e) { next(e); }
});

profileRouter.get('/family', async (req, res, next) => {
  try { res.json(await profileService.listFamilyMembers(req.user!.userId)); } catch (e) { next(e); }
});

profileRouter.delete('/family/:id', async (req, res, next) => {
  try { await profileService.deleteFamilyMember(req.user!.userId, req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});
