'use client';

import { getApp } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { User } from '@/types/user';
import { firebaseAuth } from '@/utils/firebase/config';

/**
 * Extended user profile from Firestore
 */
export interface UserProfile extends User {
  uid: string;
  email: string | null;
  name?: string;
  lastName?: string;
  avatar?: string | null;
  createdAt?: Date;
  approved: boolean;
  isProfileComplete: boolean;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  /** Firebase Auth user object (null when logged out, undefined while loading) */
  user: FirebaseUser | null | undefined;
  /** Firestore user profile document (null when logged out, undefined while loading) */
  profile: UserProfile | null | undefined;
  /** True while fetching initial auth state and profile */
  loading: boolean;
  /** Error message if profile fetch fails */
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Cost-efficient authentication provider
 *
 * Strategy:
 * - Uses onAuthStateChanged for reliable auth state detection
 * - Performs a SINGLE Firestore read when user logs in (cost-efficient)
 * - No real-time listeners (saves costs)
 * - Cleans up properly on logout
 *
 * Trade-off: Profile changes in Firestore require page refresh to reflect in Context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        // User is logged in - fetch their profile from Firestore (single read)
        setUser(firebaseUser);

        try {
          const db = getFirestore(getApp());
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: data.name,
              lastName: data.lastName,
              avatar: data.avatar,
              createdAt: data.createdAt,
              approved: data.approved ?? false,
              isProfileComplete: data.isProfileComplete ?? false,
              role: data.role || 'profesional',
            });
          } else {
            // Profile document doesn't exist yet
            setProfile(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
          setProfile(null);
        }
      } else {
        // User is logged out - reset all state
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup: unsubscribe from auth state listener
    return () => {
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
