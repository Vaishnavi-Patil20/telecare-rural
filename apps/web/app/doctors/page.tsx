'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';
import { api } from '../../lib/api';

const languages = ['', 'English', 'Hindi', 'Kannada', 'Marathi'];
const specialties = ['', 'General Physician', 'Pediatrics', 'Gynecology', 'Dermatology', 'Cardiology'];

export default function DoctorSearch() {
  const [filters, setFilters] = useState({ specialty: '', language: '', maxFee: '' });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    setLoading(true);
    api(`/doctors?${qs}`).then(setDoctors).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Find a Doctor</h1>

      <div className="card mt-6 grid gap-4 sm:grid-cols-3">
        {([
          ['Specialty', 'specialty', specialties],
          ['Language', 'language', languages],
        ] as const).map(([label, key, options]) => (
          <label key={key} className="block">
            <span className="text-sm font-medium">{label}</span>
            <select className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
              value={(filters as any)[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
              {options.map(o => <option key={o} value={o}>{o || 'Any'}</option>)}
            </select>
          </label>
        ))}
        <label className="block">
          <span className="text-sm font-medium">Max fee (₹)</span>
          <input type="number" className="mt-1 w-full rounded-xl border p-3 dark:bg-slate-800"
            value={filters.maxFee} onChange={e => setFilters(f => ({ ...f, maxFee: e.target.value }))} />
        </label>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">{[0,1,2].map(i => <div key={i} className="card h-32 animate-pulse" />)}</div>
      ) : doctors.length === 0 ? (
        <p className="mt-8 text-center text-slate-500">No doctors match your filters yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {doctors.map(d => (
            <div key={d.id} className="card">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary-dark">
                  {d.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="flex items-center gap-1 font-semibold">
                    Dr. {d.fullName}
                    {d.isVerified && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified doctor" />}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{d.specialty} · {d.experienceYears} yrs</p>
                  <p className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    {d.avgRating ?? 'New'} · {d.languages.join(', ')}
                  </p>
                  <p className="mt-1 text-sm font-medium">₹{Number(d.consultationFee)} per consultation</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/doctors/${d.id}`} className="btn-outline flex-1 !py-3">View Profile</Link>
                <Link href={`/doctors/${d.id}/book`} className="btn-primary flex-1 !py-3">Book Appointment</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
