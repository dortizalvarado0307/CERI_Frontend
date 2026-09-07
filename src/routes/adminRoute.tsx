import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({
  children
}: { children: ReactNode }) {
  const { token, isAdmin } = useAuth();

  if (!token) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/projects" />;

  return children;
}