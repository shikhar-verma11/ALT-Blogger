import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../types';
import { mockApi } from '../services/mockApi';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password_in: string) => Promise<AuthUser | null>;
  signup: (username: string, email: string, password_in: string) => Promise<AuthUser | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('blog_session');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      window.localStorage.removeItem('blog_session');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password_in: string) => {
    setLoading(true);
    const foundUser = await mockApi.login(email, password_in);
    if (foundUser) {
      setUser(foundUser);
      window.localStorage.setItem('blog_session', JSON.stringify(foundUser));
      setLoading(false);
      return foundUser;
    }
    setLoading(false);
    return null;
  }, []);

  const signup = useCallback(async (username: string, email: string, password_in: string) => {
    setLoading(true);
    try {
        const newUser = await mockApi.signup({ username, email, password: password_in });
        setUser(newUser);
        window.localStorage.setItem('blog_session', JSON.stringify(newUser));
        return newUser;
    } catch (error) {
        throw error; // re-throw to be caught in the form
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem('blog_session');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};