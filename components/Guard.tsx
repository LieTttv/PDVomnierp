
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getActiveStoreId } from '../services/authService';

interface GuardProps {
  children: React.ReactNode;
}

const Guard: React.FC<GuardProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não estiver na tela de seleção e não tiver loja ativa, obriga a escolher
  if (!getActiveStoreId() && location.pathname !== '/select-store') {
    return <Navigate to="/select-store" replace />;
  }

  return <>{children}</>;
};

export default Guard;
