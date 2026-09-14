import { prisma } from '../../lib/prisma';

export const doctorRepository = {
  findById: (id: string) => prisma.doctor.findUnique({
    where: { id },
    include: { user: { select: { status: true } }, availability: true, documents: true, reviews: true },
  }),
  findByUserId: (userId: string) => prisma.doctor.findUnique({ where: { userId }, include: { availability: true } }),

  search(filters: {
    specialty?: string; language?: string; minExperience?: number; maxFee?: number;
    gender?: string; verifiedOnly?: boolean; skip: number; take: number;
  }) {
    return prisma.doctor.findMany({
      where: {
        AND: [
          filters.verifiedOnly === false ? {} : { isVerified: true }, // only verified doctors are bookable
          filters.specialty ? { specialty: { equals: filters.specialty, mode: 'insensitive' } } : {},
          filters.language ? { languages: { has: filters.language } } : {},
          filters.minExperience ? { experienceYears: { gte: filters.minExperience } } : {},
          filters.maxFee ? { consultationFee: { lte: filters.maxFee } } : {},
          filters.gender ? { gender: filters.gender as any } : {},
        ],
      },
      include: {
        reviews: { select: { rating: true } },
        availability: { where: { isActive: true } },
        _count: { select: { appointments: true } },
      },
      skip: filters.skip, take: filters.take,
      orderBy: { experienceYears: 'desc' },
    });
  },

  setAvailability: (doctorId: string, slots: any[]) =>
    prisma.$transaction([
      prisma.doctorAvailability.deleteMany({ where: { doctorId } }),
      prisma.doctorAvailability.createMany({ data: slots.map(s => ({ ...s, doctorId })) }),
    ]),

  takenSlots: (doctorId: string, dayStart: Date, dayEnd: Date) =>
    prisma.appointment.findMany({
      where: { doctorId, scheduledAt: { gte: dayStart, lt: dayEnd }, status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] } },
      select: { scheduledAt: true },
    }),
};
