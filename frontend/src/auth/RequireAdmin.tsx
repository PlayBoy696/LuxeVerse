import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <div className="text-slate-400">Loading…</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
