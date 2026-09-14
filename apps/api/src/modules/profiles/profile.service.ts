import { Forbidden } from '../../lib/errors';
import { profileRepository } from './profile.repository';

const patientSchemaFields = ['fullName','dob','gender','address','villageId','emergencyContact','bloodGroup','allergies','conditions'];

export const profileService = {
  async getMyProfile(userId: string) {
    const patient = await profileRepository.getPatientByUserId(userId);
    if (!patient) return null;
    return patient;
  },

  async updateMyProfile(userId: string, input: any) {
    const data: any = {};
    for (const f of patientSchemaFields) if (input[f] !== undefined) data[f] = input[f];
    if (Object.keys(data).length === 0) return this.getMyProfile(userId);
    return profileRepository.upsertPatient(userId, data);
  },

  async addFamilyMember(userId: string, input: { fullName: string; relation: string; dob?: string; gender?: string; notes?: string }) {
    const patient = await profileRepository.getPatientByUserId(userId);
    if (!patient) throw Forbidden('Complete your profile first');
    return profileRepository.addFamilyMember(patient.id, input);
  },

  listFamilyMembers: (userId: string) => profileRepository.getPatientByUserId(userId)
    .then(p => (p ? profileRepository.listFamilyMembers(p.id) : [])),

  async deleteFamilyMember(userId: string, memberId: string) {
    const patient = await profileRepository.getPatientByUserId(userId);
    if (!patient) throw Forbidden();
    return profileRepository.deleteFamilyMember(memberId, patient.id);
  },
};
