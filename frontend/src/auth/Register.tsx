import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import Seo from '../seo/Seo.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({ email, password, name, username });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Seo
        title="Create Account | LuxeVerse"
        description="Create a LuxeVerse account to save favorites and continue your content journey."
        canonicalPath="/register"
        robots="noindex,nofollow"
      />
      <div className="w-full max-w-md">
      <div className="mb-8 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Start your journey</p><h1 className="mt-3 text-3xl font-semibold text-white">Create your account</h1><p className="mt-2 text-sm text-slate-400">Save favorites and pick up where you left off.</p></div>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 sm:p-8">
        {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Name</div>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Username</div>
          <input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Email</div>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Password</div>
          <input required type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-fuchsia-600 px-4 py-3 font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 disabled:cursor-wait disabled:opacity-50">{loading ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-medium text-fuchsia-300 hover:text-fuchsia-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Sign in</Link></p>
      </form>
      </div>
    </div>
  );
}
