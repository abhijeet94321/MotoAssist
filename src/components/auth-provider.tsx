"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase'; // Ensure db is exported from firebase config

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // This prevents rendering children on the login page until auth state is confirmed
  // to avoid flashing the main page if the user is not authenticated.
  if (!user && pathname !== '/login') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }
  
  if (user && pathname === '/login') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to dashboard...</div>
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
