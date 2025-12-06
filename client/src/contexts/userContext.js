import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/helper/supabase'

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Error fetching session:', error);
      setSession(data?.session || null);
      setLoading(false);
    };
  
    fetchSession();
  
    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });
  
    return () => data?.subscription?.unsubscribe(); // Cleanup
  }, []);
  

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);