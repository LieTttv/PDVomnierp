
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getActiveStoreId, isMaster } from '../services/authService';

interface GuardProps {
  children: React.ReactNode;
}

const Guard: React.FC<GuardProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check master local session first
    if (isMaster()) {
      setSession({ user: { role: 'master' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Master users bypass the store check to reach management pages
  const master = isMaster();
  const hasStore = !!getActiveStoreId();

  if (!master && !hasStore && location.pathname !== '/select-store') {
    return <Navigate to="/select-store" replace />;
  }

  return <>{children}</>;
};

export default Guard;
