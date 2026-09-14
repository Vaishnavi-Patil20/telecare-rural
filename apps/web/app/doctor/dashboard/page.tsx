'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotMinutes: 15 },
    { dayOfWeek: 1, startTime: '14:00', endTime: '17:00', slotMinutes: 15 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '13:00', slotMinutes: 15 },
  ]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // doctor's own schedule endpoint is Phase 3; for now show appointments via admin-free placeholder
    api('/appointments/mine').then(setAppointments).catch(() => {});
  }, []);

  async function saveAvailability() {
    await api('/doctors/me/availability', { method: 'PUT', body: JSON.stringify({ slots }) });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  const today = new Date().toDateString();
  const todays = appointments.filter(a => new Date(a.scheduledAt).toDateString() === today);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-3xl font-bold text-primary">{todays.length}</p><p className="text-sm text-slate-500">Today&apos;s appointments</p></div>
        <div className="card"><p className="text-3xl font-bold text-primary">{appointments.filter(a => a.status === 'PENDING').length}</p><p className="text-sm text-slate-500">Pending requests</p></div>
        <div className="card"><p className="text-3xl font-bold text-primary">{appointments.filter(a => a.status === 'COMPLETED').length}</p><p className="text-sm text-slate-500">Completed</p></div>
      </div>

      <section className="card mt-8">
        <h2 className="font-semibold">Availability</h2>
        <p className="mt-1 text-sm text-slate-500">Patients can only book inside these windows.</p>
        <ul className="mt-4 space-y-2">
          {slots.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 rounded-xl bg-primary-light/50 p-3 dark:bg-slate-800">
              <select className="rounded-lg border p-2 dark:bg-slate-900" value={s.dayOfWeek}
                onChange={e => setSlots(sl => sl.map((x, j) => j === i ? { ...x, dayOfWeek: Number(e.target.value) } : x))}>
                {days.map((d, di) => <option key={d} value={di}>{d}</option>)}
              </select>
              {(['startTime', 'endTime'] as const).map(k => (
                <input key={k} type="time" className="rounded-lg border p-2 dark:bg-slate-900" value={s[k]}
                  onChange={e => setSlots(sl => sl.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))} />
              ))}
              <button className="ml-auto text-sm text-red-600"
                onClick={() => setSlots(sl => sl.filter((_, j) => j !== i))}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-3">
          <button className="btn-outline !py-3" onClick={() => setSlots(s => [...s, { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotMinutes: 15 }])}>
            Add hours
          </button>
          <button className="btn-primary !py-3" onClick={saveAvailability}>Save Availability</button>
        </div>
        {saved && <p className="mt-3 text-sm font-medium text-primary">Availability saved.</p>}
      </section>

      <section className="card mt-8">
        <h2 className="font-semibold">Appointments</h2>
        {appointments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No appointments yet.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {appointments.map(a => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{new Date(a.scheduledAt).toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{a.type} · {a.triagePriority}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    a.status === 'CONFIRMED' ? 'bg-primary-light text-primary-dark' :
                    a.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>{a.status}</span>
                  {a.status === 'PENDING' && (
                    <button className="btn-primary !px-4 !py-2 !text-sm"
                      onClick={() => api(`/appointments/${a.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) })
                        .then(() => setAppointments(ap => ap.map(x => x.id === a.id ? { ...x, status: 'CONFIRMED' } : x)))}>
                      Confirm
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
