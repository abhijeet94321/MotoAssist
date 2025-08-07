"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        description = 'Incorrect email or password. Please try again.';
      }
      toast({
        title: 'Login Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">MotoAssist Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Register here
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
