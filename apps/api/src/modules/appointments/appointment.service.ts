import { AppointmentStatus, TriagePriority } from '@prisma/client';
import { appointmentRepository } from './appointment.repository';
import { Conflict, NotFound, Forbidden, BadRequest } from '../../lib/errors';
import { notificationService } from '../notifications/notification.service';
import { auditService } from '../audit/audit.service';

export const appointmentService = {
  async book(patientId: string, input: {
    doctorId: string; scheduledAt: string; familyMemberId?: string;
    reason?: string; symptoms?: string; type?: string;
  }) {
    const scheduledAt = new Date(input.scheduledAt);
    if (isNaN(scheduledAt.getTime())) throw BadRequest('Invalid date/time');
    if (scheduledAt < new Date()) throw BadRequest('Cannot book a slot in the past');

    const existing = await appointmentRepository.findByDoctorAndTime(input.doctorId, scheduledAt);
    if (existing) throw Conflict('This slot was just taken. Please choose another time.');

    // triage support only — never presented as a diagnosis
    const triagePriority = this.triage(input.symptoms ?? '');

    const appt = await appointmentRepository.create({
      patientId, doctorId: input.doctorId, scheduledAt,
      familyMemberId: input.familyMemberId, reason: input.reason,
      symptoms: input.symptoms, triagePriority,
      type: input.type ?? 'VIDEO',
    });

    const booked = (await appointmentRepository.findById(appt.id))!;
    await notificationService.notify(booked.patient.userId, 'APPOINTMENT_BOOKED' as any, 'Appointment booked',
      `Your consultation is booked for ${scheduledAt.toLocaleString()}.`);
    return appt;
  },

  async setStatus(appointmentId: string, status: AppointmentStatus, actor: { userId: string; role: string }) {
    const appt = await appointmentRepository.findById(appointmentId);
    if (!appt) throw NotFound('Appointment not found');
    const isDoctor = actor.role === 'DOCTOR' && appt.doctor.userId === actor.userId;
    const isPatient = appt.patient.userId === actor.userId;
    if (!isDoctor && !isPatient && actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') throw Forbidden();

    if (status === 'CANCELLED' && appt.status === 'COMPLETED') throw BadRequest('Cannot cancel a completed consultation');
    const updated = await appointmentRepository.updateStatus(appointmentId, status);
    await notificationService.notify(appt.patient.userId, 'APPOINTMENT_CHANGED',
      `Appointment ${status.toLowerCase()}`, `Your appointment status changed to ${status}.`);
    await auditService.log(actor.userId, `APPOINTMENT_${status}`, 'Appointment', appointmentId);
    return updated;
  },

  // Very conservative keyword triage — ROUTINE by default, EMERGENCY_WARNING for red-flag words.
  triage(symptoms: string): TriagePriority {
    const s = symptoms.toLowerCase();
    const emergency = ['chest pain', 'can't breathe', 'cannot breathe', 'unconscious', 'severe bleeding', 'stroke', 'suicide'];
    if (emergency.some(k => s.includes(k))) return 'EMERGENCY_WARNING';
    const high = ['high fever', 'blood in', 'severe pain', 'fainted', 'seizure'];
    if (high.some(k => s.includes(k))) return 'HIGH_PRIORITY';
    if (['fever', 'pain', 'vomit', 'dizzy', 'injury'].some(k => s.includes(k))) return 'SOON';
    return 'ROUTINE';
  },
};
