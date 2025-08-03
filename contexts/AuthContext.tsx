import React, { createContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    User as FirebaseUser // Rename the import
} from "firebase/auth";
import type { AuthUser } from '../types'; // Import your custom user type
import {app} from '../firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password_in: string) => Promise<void>;
  signup: (username: string, email: string, password_in: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Create an AuthUser object that matches your app's structure
        const appUser: AuthUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'No Name', // Fallback for username
          email: firebaseUser.email || '', // Fallback for email
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password_in: string) => {
    await signInWithEmailAndPassword(auth, email, password_in);
  };

  const signup = async (username: string, email: string, password_in: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password_in);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: username
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};