'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function BookAppointment({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [family, setFamily] = useState<any[]>([]);
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api(`/doctors/${params.id}/slots?date=${date}`).then(r => {
      setSlots(r.slots); setSlot('');
    }).catch(e => setError(e.message));
    api('/profiles/family').then(setFamily).catch(() => {});
  }, [params.id, date]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      await api('/appointments', {
        method: 'POST',
        body: JSON.stringify({ doctorId: params.id, scheduledAt: slot, reason, symptoms,
          familyMemberId: familyMemberId || undefined }),
      });
      setDone(true);
    } catch (err: any) { setError(err.message); }
  }

  if (done) return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="card">
        <h1 className="text-xl font-bold text-primary-dark dark:text-primary-light">Appointment booked</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Your consultation is scheduled. You will receive a confirmation notification.
        </p>
        <button className="btn-primary mt-6" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Book Appointment</h1>
      <form onSubmit={submit} className="card mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Date</span>
          <input type="date" required className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
            value={date} min={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} />
        </label>

        <div>
          <span className="text-sm font-medium">Available times</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {slots.length === 0 && <p className="col-span-3 text-sm text-slate-500">No slots available this day.</p>}
            {slots.map(s => (
              <button key={s} type="button" onClick={() => setSlot(s)}
                className={`rounded-xl border p-3 text-sm font-medium ${slot === s ? 'border-primary bg-primary text-white' : 'hover:border-primary'}`}>
                {new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>

        {family.length > 0 && (
          <label className="block">
            <span className="text-sm font-medium">Booking for</span>
            <select className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
              value={familyMemberId} onChange={e => setFamilyMemberId(e.target.value)}>
              <option value="">Myself</option>
              {family.map(f => <option key={f.id} value={f.id}>{f.fullName} ({f.relation})</option>)}
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium">Reason for consultation</span>
          <input className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
            value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Follow-up, fever" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Symptoms (optional)</span>
          <textarea rows={3} className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
            value={symptoms} onChange={e => setSymptoms(e.target.value)}
            placeholder="Describe how you feel — this helps the doctor prepare. This is not a diagnosis." />
        </label>

        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Urgent symptoms like chest pain, difficulty breathing, or severe bleeding require immediate
          in-person care — please visit the nearest healthcare facility.
        </p>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button type="submit" disabled={!slot} className="btn-primary w-full disabled:opacity-50">
          Confirm Booking
        </button>
      </form>
    </main>
  );
}
