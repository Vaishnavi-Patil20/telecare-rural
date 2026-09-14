'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';
import { api } from '../../../lib/api';

export default function DoctorProfile({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    api(`/doctors/${params.id}`).then(setDoctor).catch(() => {});
  }, [params.id]);

  if (!doctor) return <main className="mx-auto max-w-3xl px-4 py-8"><div className="card h-64 animate-pulse" /></main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary-dark">
            {doctor.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              Dr. {doctor.fullName}
              {doctor.isVerified && <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified doctor" />}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{doctor.qualification} · {doctor.specialty}</p>
            <p className="mt-1 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {doctor.avgRating ?? 'No ratings yet'} · {doctor._count?.appointments ?? 0} consultations
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Experience</dt><dd>{doctor.experienceYears} years</dd></div>
          <div><dt className="font-semibold">Languages</dt><dd>{doctor.languages.join(', ')}</dd></div>
          <div><dt className="font-semibold">Consultation fee</dt><dd>₹{Number(doctor.consultationFee)}</dd></div>
          <div><dt className="font-semibold">Reviews</dt><dd>{doctor.reviews?.length ?? 0}</dd></div>
        </dl>

        {doctor.about && (
          <p className="mt-6 text-slate-600 dark:text-slate-300">{doctor.about}</p>
        )}
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Patient Reviews</h2>
        {doctor.reviews?.length ? (
          <ul className="mt-4 space-y-3">
            {doctor.reviews.map((r: any) => (
              <li key={r.id} className="rounded-xl bg-primary-light/50 p-4 dark:bg-slate-800">
                <p className="font-medium">{r.rating}/5 stars</p>
                {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-slate-500">No reviews yet.</p>}
      </div>

      <Link href={`/doctors/${doctor.id}/book`} className="btn-primary mt-6 w-full">Book Appointment</Link>
    </main>
  );
}
