import { emergencyDisclaimer } from '../../lib/api';
import Link from 'next/link';

export default function EmergencyPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-8 text-center dark:bg-red-950">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">Emergency Assistance</h1>
        <p className="mt-4 text-red-800 dark:text-red-200">{emergencyDisclaimer}</p>
        <div className="mt-8 space-y-3">
          <a href="tel:102" className="btn-primary block w-full !bg-red-600 hover:!bg-red-700">Call Ambulance (102)</a>
          <a href="tel:112" className="btn-outline block w-full !border-red-500 !text-red-600">Call Emergency (112)</a>
          <Link href="/facilities" className="block pt-2 text-sm font-medium text-red-700 underline dark:text-red-300">
            Find Healthcare Near Me
          </Link>
        </div>
      </div>
    </main>
  );
}
