'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'verify' | 'users'>('verify');

  const load = () => {
    api('/admin/stats').then(setStats).catch(() => {});
    api('/admin/doctors/pending').then(setPending).catch(() => {});
    api('/admin/users').then(setUsers).catch(() => {});
  };
  useEffect(load, []);

  async function verify(id: string, approved: boolean) {
    const reason = approved ? undefined : prompt('Reason for rejection (optional)') ?? undefined;
    await api(`/admin/doctors/${id}/verify`, { method: 'POST', body: JSON.stringify({ approved, reason }) });
    load();
  }

  async function setStatus(id: string, status: string) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this account?`)) return;
    await api(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries({ Patients: stats.patients, Doctors: stats.doctors, 'Verified doctors': stats.verifiedDoctors,
            'Health workers': stats.healthWorkers, Appointments: stats.appointments, Consultations: stats.consultations }).map(([k, v]) => (
            <div key={k} className="card !p-4 text-center">
              <p className="text-2xl font-bold text-primary">{v as any}</p>
              <p className="text-xs text-slate-500">{k}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-2">
        {(['verify', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-3 font-medium ${tab === t ? 'bg-primary text-white' : 'border'}`}>
            {t === 'verify' ? `Pending Verification (${pending.length})` : 'User Management'}
          </button>
        ))}
      </div>

      {tab === 'verify' && (
        <section className="mt-4 space-y-4">
          {pending.length === 0 && <p className="text-sm text-slate-500">No pending doctor applications.</p>}
          {pending.map(d => (
            <div key={d.id} className="card">
              <p className="font-semibold">Dr. {d.fullName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{d.qualification} · {d.specialty} · {d.experienceYears} yrs</p>
              <p className="mt-1 text-sm text-slate-500">{d.user.phone} {d.user.email ? `· ${d.user.email}` : ''}</p>
              <p className="mt-1 text-xs text-slate-500">Documents on file: {d.documents.map((doc: any) => doc.docType).join(', ') || 'none'}</p>
              <div className="mt-4 flex gap-3">
                <button className="btn-primary !py-3" onClick={() => verify(d.id, true)}>Approve</button>
                <button className="btn-outline !py-3 !border-red-500 !text-red-600" onClick={() => verify(d.id, false)}>Reject</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'users' && (
        <section className="card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-slate-500">
              <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{u.patient?.fullName ?? u.doctor?.fullName ?? u.healthWorker?.fullName ?? '—'}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.status}</td>
                  <td className="p-3">
                    {u.status === 'ACTIVE'
                      ? <button className="font-medium text-red-600" onClick={() => setStatus(u.id, 'SUSPENDED')}>Suspend</button>
                      : <button className="font-medium text-primary" onClick={() => setStatus(u.id, 'ACTIVE')}>Activate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
