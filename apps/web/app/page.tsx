import { Stethoscope, WifiOff, Languages, FolderHeart, ShieldCheck, HeartHandshake } from 'lucide-react';

const features = [
  { icon: Stethoscope, title: 'Remote Doctor Access', desc: 'Consult qualified doctors without travelling long distances.' },
  { icon: WifiOff, title: 'Low-Bandwidth Consultation', desc: 'Audio-first mode that adapts when your connection is weak.' },
  { icon: Languages, title: 'Regional Languages', desc: 'English, Hindi, Kannada and Marathi — with voice input support.' },
  { icon: FolderHeart, title: 'Digital Medical Records', desc: 'All your reports and prescriptions in one secure place.' },
  { icon: ShieldCheck, title: 'Secure Healthcare Data', desc: 'Your medical information is encrypted and never publicly exposed.' },
  { icon: HeartHandshake, title: 'Rural Health Worker Support', desc: 'Trained health workers help patients at every step.' },
];

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-light to-white dark:from-slate-900 dark:to-slate-950 px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary-dark dark:text-primary-light">
          Healthcare Beyond Distance
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Connect with qualified doctors from anywhere, even when distance and connectivity make healthcare difficult.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/book" className="btn-primary w-full sm:w-auto">Book a Consultation</a>
          <a href="/doctors" className="btn-outline w-full sm:w-auto">Find a Doctor</a>
        </div>
        <a href="/doctor/register" className="mt-6 inline-block text-sm font-medium text-accent underline">
          I&apos;m a Doctor
        </a>
        <p className="mt-12 text-xs text-slate-500 max-w-xl mx-auto">
          Telemedicine may not be suitable for emergencies. For emergencies, please contact local emergency
          services or visit the nearest healthcare facility immediately.
        </p>
      </section>

      {/* Why TeleCare Rural */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Why TeleCare Rural?</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="card">
              <f.icon className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials (sample content, clearly labeled) */}
      <section className="bg-primary-light/50 dark:bg-slate-900 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs uppercase tracking-wide text-slate-500 mb-2">Sample content — real testimonials appear after launch</p>
          <blockquote className="card text-center italic">
            &ldquo;I spoke to a doctor from my village without a two-hour bus ride. The audio mode worked even on my slow connection.&rdquo;
            <footer className="mt-4 not-italic font-semibold">— Sample testimonial, Rural Karnataka</footer>
          </blockquote>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a><a href="/help">Help Center</a><a href="/doctor/register">Doctor Registration</a>
        </nav>
        <p className="mt-6">&copy; 2026 TeleCare Rural. AI-assisted features provide information only and do not replace professional medical advice.</p>
      </footer>
    </main>
  );
}
