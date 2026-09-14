import { prisma } from '../../lib/prisma';

export const profileRepository = {
  getPatientByUserId: (userId: string) => prisma.patient.findUnique({
    where: { userId }, include: { familyMembers: true, village: { include: { district: true } } },
  }),
  upsertPatient: (userId: string, data: any) =>
    prisma.patient.upsert({ where: { userId }, create: { userId, ...data }, update: data }),
  addFamilyMember: (patientId: string, data: any) =>
    prisma.patientFamilyMember.create({ data: { patientId, ...data } }),
  listFamilyMembers: (patientId: string) => prisma.patientFamilyMember.findMany({ where: { patientId } }),
  deleteFamilyMember: (id: string, patientId: string) =>
    prisma.patientFamilyMember.deleteMany({ where: { id, patientId } }), // ownership enforced here
};
