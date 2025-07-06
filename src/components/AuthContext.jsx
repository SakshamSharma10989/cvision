'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const isAuth = storedAuth === 'true';
    setIsAuthenticated(isAuth);
    console.log('🔐 Hydrated isAuthenticated:', isAuth);
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // Prevent early rendering

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
