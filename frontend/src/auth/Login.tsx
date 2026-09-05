import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import Seo from '../seo/Seo.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Seo
        title="Login | LuxeVerse"
        description="Sign in to your LuxeVerse account to continue exploring videos and films."
        canonicalPath="/login"
        robots="noindex,nofollow"
      />
      <div className="w-full max-w-md">
      <div className="mb-8 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Welcome back</p><h1 className="mt-3 text-3xl font-semibold text-white">Sign in to LuxeVerse</h1><p className="mt-2 text-sm text-slate-400">Continue exploring your video library.</p></div>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 sm:p-8">
        {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Email</div>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <label className="block">
          <div className="mb-2 text-sm font-medium text-slate-200">Password</div>
          <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20" />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-fuchsia-600 px-4 py-3 font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 disabled:cursor-wait disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-sm text-slate-400">New to LuxeVerse? <Link to="/register" className="font-medium text-fuchsia-300 hover:text-fuchsia-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Create an account</Link></p>
      </form>
      </div>
    </div>
  );
}
