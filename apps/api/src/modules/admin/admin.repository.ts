import { prisma } from '../../lib/prisma';

export const adminRepository = {
  listUsers: (q: { role?: any; status?: any; search?: string; skip: number; take: number }) =>
    prisma.user.findMany({
      where: {
        AND: [
          q.role ? { role: q.role } : {},
          q.status ? { status: q.status } : {},
          q.search ? { OR: [{ phone: { contains: q.search } }, { email: { contains: q.search, mode: 'insensitive' } }] } : {},
        ],
      },
      select: { id: true, phone: true, email: true, role: true, status: true, createdAt: true,
                patient: { select: { fullName: true } }, doctor: { select: { fullName: true, isVerified: true, verificationStatus: true } },
                healthWorker: { select: { fullName: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' }, skip: q.skip, take: q.take,
    }),

  setUserStatus: (id: string, status: any) => prisma.user.update({ where: { id }, data: { status } }),

  doctorsPending: () => prisma.doctor.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { documents: true, user: { select: { phone: true, email: true, status: true } } },
  }),

  setDoctorVerification: (doctorId: string, approved: boolean) =>
    prisma.doctor.update({
      where: { id: doctorId },
      data: { isVerified: approved, verificationStatus: approved ? 'APPROVED' : 'REJECTED' },
    }),

  stats: async () => {
    const [patients, doctors, verifiedDoctors, healthWorkers, appointments, consultations] = await prisma.$transaction([
      prisma.patient.count(), prisma.doctor.count(),
      prisma.doctor.count({ where: { isVerified: true } }),
      prisma.healthWorker.count(), prisma.appointment.count(), prisma.consultation.count(),
    ]);
    return { patients, doctors, verifiedDoctors, healthWorkers, appointments, consultations };
  },
};
