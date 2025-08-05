"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase'; // Import db to ensure Firebase is initialized

const AuthContext = createContext<{ user: User | null; loading: boolean, signOut: () => void; }>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // While loading, or if we are on an auth page, we can render the children
  // immediately. The redirect logic will handle moving the user if necessary
  // once loading is complete.
  if (loading || isAuthPage) {
     return (
        <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
     );
  }

  // If not loading and not on an auth page, but there's no user,
  // we don't render children to prevent a flash of content.
  // The useEffect above will handle the redirect.
  if (!user) {
    return null; 
  }

  // If we have a user and are not on an auth page, render the children.
  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
