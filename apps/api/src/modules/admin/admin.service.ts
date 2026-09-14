import { NotFound, BadRequest } from '../../lib/errors';
import { adminRepository } from './admin.repository';
import { auditService } from '../audit/audit.service';
import { notificationService } from '../notifications/notification.service';

export const adminService = {
  listUsers(query: any) {
    return adminRepository.listUsers({
      role: query.role, status: query.status,
      search: query.search, skip: query.page ? (Number(query.page) - 1) * 25 : 0, take: 25,
    });
  },

  async setUserStatus(actorId: string, userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') {
    if (userId === actorId) throw BadRequest('You cannot change your own account status');
    const user = await adminRepository.setUserStatus(userId, status);
    await auditService.log(actorId, `USER_${status}`, 'User', userId);
    return { id: user.id, status: user.status };
  },

  doctorsPending: () => adminRepository.doctorsPending(),

  async verifyDoctor(actorId: string, doctorId: string, approved: boolean, reason?: string) {
    const doctor = await adminRepository.setDoctorVerification(doctorId, approved);
    await auditService.log(actorId, approved ? 'DOCTOR_APPROVED' : 'DOCTOR_REJECTED', 'Doctor', doctorId, { reason });
    // doctor is notified in-app; email adapter plugs into notificationService later
    const d = doctor as any;
    await notificationService.notify(d.userId, 'SYSTEM' as any,
      approved ? 'Your account has been verified' : 'Your application was not approved',
      reason);
    return { id: doctor.id, isVerified: doctor.isVerified };
  },

  stats: () => adminRepository.stats(),
};
