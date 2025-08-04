import React, { createContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    User as FirebaseUser
} from "firebase/auth";
import type { AuthUser } from '../types';
import { app } from '../firebase';

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
        const appUser: AuthUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'No Name',
          email: firebaseUser.email || '',
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

  // --- THIS FUNCTION IS UPDATED ---
  const signup = async (username: string, email: string, password_in: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password_in);
    
    if (userCredential.user) {
      // 1. Wait for the profile to be updated
      await updateProfile(userCredential.user, {
        displayName: username
      });
      // 2. Force a reload of the user data to get the new displayName
      await userCredential.user.reload();
      // 3. Manually update our app's state with the now-complete user object
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
          const appUser: AuthUser = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName || 'No Name',
              email: firebaseUser.email || '',
          };
          setUser(appUser);
      }
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