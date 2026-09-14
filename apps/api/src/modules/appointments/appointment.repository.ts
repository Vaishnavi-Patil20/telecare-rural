import { prisma } from '../../lib/prisma';

export const appointmentRepository = {
  create: (data: any) => prisma.appointment.create({ data }),
  findById: (id: string) => prisma.appointment.findUnique({ where: { id }, include: { doctor: true, patient: true } }),
  findByDoctorAndTime: (doctorId: string, scheduledAt: Date) =>
    prisma.appointment.findUnique({ where: { doctorId_scheduledAt: { doctorId, scheduledAt } } }),
  listForPatient: (patientId: string) =>
    prisma.appointment.findMany({ where: { patientId }, orderBy: { scheduledAt: 'desc' }, include: { doctor: true } }),
  updateStatus: (id: string, status: any) => prisma.appointment.update({ where: { id }, data: { status } }),
};
