import React, { createContext, useState, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification // 1. Import the new function
} from "firebase/auth";
import type { AuthUser } from '../types';
import { app } from '../firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password_in: string) => Promise<void>;
  signup: (username: string, email: string, password_in: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // 2. Add emailVerified property when creating the user object
        const appUser: AuthUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'No Name',
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified, // Add this
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

  // --- THIS IS THE UPDATED SIGNUP FUNCTION ---
  const signup = async (username: string, email: string, password_in: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password_in);
    const firebaseUser = userCredential.user;
    
    if (firebaseUser) {
      // 3. Send the verification email immediately after creation
      await sendEmailVerification(firebaseUser);
      
      await updateProfile(firebaseUser, {
        displayName: username
      });
      // We no longer need to reload or set the user manually here.
      // onAuthStateChanged will automatically pick up the new user.
    }
  };

  const logout = async () => {
    await signOut(auth);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};