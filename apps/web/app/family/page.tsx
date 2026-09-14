'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function FamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({ fullName: '', relation: '', notes: '' });
  const [error, setError] = useState('');

  const load = () => api('/profiles/family').then(setMembers).catch(() => {});
  useEffect(load, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api('/profiles/family', { method: 'POST', body: JSON.stringify(form) }); setForm({ fullName: '', relation: '', notes: '' }); load(); }
    catch (err: any) { setError(err.message); }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Family</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Add family members so you can book appointments and keep separate medical information for each.
      </p>

      <ul className="mt-6 space-y-3">
        {members.map(m => (
          <li key={m.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{m.fullName}</p>
              <p className="text-sm text-slate-500">{m.relation}</p>
            </div>
            <button className="text-sm font-medium text-red-600"
              onClick={async () => { await api(`/profiles/family/${m.id}`, { method: 'DELETE' }); load(); }}>
              Remove
            </button>
          </li>
        ))}
        {members.length === 0 && <p className="text-sm text-slate-500">No family members added yet.</p>}
      </ul>

      <form onSubmit={add} className="card mt-8 space-y-4">
        <h2 className="font-semibold">Add Family Member</h2>
        <input required placeholder="Full name" className="w-full rounded-xl border p-3 dark:bg-slate-800"
          value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <input required placeholder="Relation (e.g. Mother, Child)" className="w-full rounded-xl border p-3 dark:bg-slate-800"
          value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} />
        <input placeholder="Notes (optional)" className="w-full rounded-xl border p-3 dark:bg-slate-800"
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full">Add Member</button>
      </form>
    </main>
  );
}
