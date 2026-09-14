'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, Pill, MessageSquare, AlertTriangle, Search, Users } from 'lucide-react';
import { api } from '../../lib/api';

const quickActions = [
  { href: '/doctors', icon: Search, label: 'Find Doctor' },
  { href: '/book', icon: Calendar, label: 'Book Appointment' },
  { href: '/records', icon: FileText, label: 'Medical Records' },
  { href: '/prescriptions', icon: Pill, label: 'Prescriptions' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
];

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api('/appointments/mine').then(setAppointments).catch(() => {});
    api('/profiles/me').then(setProfile).catch(() => {});
  }, []);

  const upcoming = appointments.find(a => ['PENDING', 'CONFIRMED'].includes(a.status));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        Good morning, {profile?.fullName ?? 'there'}
      </h1>

      {upcoming ? (
        <section className="card mt-6 border-l-4 border-primary">
          <p className="text-xs font-semibold uppercase text-primary">Upcoming Appointment</p>
          <p className="mt-2 text-lg font-semibold">Dr. {upcoming.doctor?.fullName}</p>
          <p className="text-slate-600 dark:text-slate-300">
            {new Date(upcoming.scheduledAt).toLocaleString()}
          </p>
          <Link href={`/consult/${upcoming.id}`} className="btn-primary mt-4">Join Consultation</Link>
        </section>
      ) : (
        <section className="card mt-6">
          <p className="text-slate-600 dark:text-slate-300">No upcoming appointments.</p>
          <Link href="/doctors" className="btn-primary mt-4">Find a Doctor</Link>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {quickActions.map(a => (
            <Link key={a.label} href={a.href} className="card flex items-center gap-3 hover:ring-2 hover:ring-primary">
              <a.icon className="h-6 w-6 text-primary" aria-hidden />
              <span className="font-medium">{a.label}</span>
            </Link>
          ))}
          <Link href="/emergency" className="card flex items-center gap-3 border-2 border-red-300 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden />
            <span className="font-semibold text-red-700 dark:text-red-300">Emergency Help</span>
          </Link>
          <Link href="/family" className="card flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" aria-hidden />
            <span className="font-medium">My Family</span>
          </Link>
        </div>
      </section>

      <a href="/help" className="btn-outline mt-8 w-full sm:w-auto">Need Help?</a>
    </main>
  );
}
