import { NotFound, Forbidden } from '../../lib/errors';
import { doctorRepository } from './doctor.repository';

export const doctorService = {
  async getProfile(id: string) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw NotFound('Doctor not found');
    const { documents, ...safe } = doctor as any;
    return { ...safe, avgRating: this.avg(doctor.reviews), documents: undefined };
  },

  async search(query: any) {
    const filters = {
      specialty: query.specialty, language: query.language,
      minExperience: query.minExperience ? Number(query.minExperience) : undefined,
      maxFee: query.maxFee ? Number(query.maxFee) : undefined,
      gender: query.gender, verifiedOnly: query.verifiedOnly !== 'false',
      skip: query.page ? (Number(query.page) - 1) * 12 : 0, take: 12,
    };
    const results = await doctorRepository.search(filters);
    return results.map(d => ({
      id: d.id, fullName: d.fullName, specialty: d.specialty, qualification: d.qualification,
      experienceYears: d.experienceYears, languages: d.languages, consultationFee: d.consultationFee,
      gender: d.gender, isVerified: d.isVerified, avgRating: this.avg(d.reviews),
      totalConsultations: d._count.appointments,
    }));
  },

  async setAvailability(userId: string, slots: any[]) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw NotFound('Doctor profile not found');
    if (slots.length > 100) throw Forbidden('Too many availability rules');
    for (const s of slots) {
      if (s.dayOfWeek < 0 || s.dayOfWeek > 6) throw Forbidden('dayOfWeek must be 0–6');
      if (!/^\d{2}:\d{2}$/.test(s.startTime) || !/^\d{2}:\d{2}$/.test(s.endTime))
        throw Forbidden('Times must be HH:MM');
      if (s.startTime >= s.endTime) throw Forbidden('startTime must be before endTime');
    }
    await doctorRepository.setAvailability(doctor.id, slots);
    return { ok: true };
  },

  // Generate bookable slots for a date, excluding taken slots.
  async availableSlots(doctorId: string, dateStr: string) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) throw NotFound('Doctor not found');
    if (!doctor.isVerified) throw Forbidden('This doctor is not yet verified');

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw NotFound('Invalid date');
    const day = date.getDay();

    const rules = doctor.availability.filter(r => r.dayOfWeek === day && r.isActive);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
    const taken = new Set((await doctorRepository.takenSlots(doctorId, dayStart, dayEnd)).map(a => a.scheduledAt.getTime()));

    const slots: string[] = [];
    const now = new Date();
    for (const rule of rules) {
      const [sh, sm] = rule.startTime.split(':').map(Number);
      const [eh, em] = rule.endTime.split(':').map(Number);
      let cursor = new Date(date); cursor.setHours(sh, sm, 0, 0);
      const end = new Date(date); end.setHours(eh, em, 0, 0);
      while (cursor < end) {
        if (cursor > now && !taken.has(cursor.getTime()))
          slots.push(cursor.toISOString());
        cursor = new Date(cursor.getTime() + rule.slotMinutes * 60000);
      }
    }
    return slots;
  },

  avg(reviews: { rating: number }[]) {
    if (!reviews.length) return null;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  },
};
