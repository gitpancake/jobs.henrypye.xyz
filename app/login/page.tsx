'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Fade } from '@/components/animate-ui/primitives/effects/fade';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const idToken = await cred.user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
        setPassword('');
      }
    } catch {
      setError('Invalid credentials');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Fade className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm font-bold tracking-tight">
              jobs.
            </CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              {resetSent && (
                <p className="text-xs text-green-600 dark:text-green-400">Password reset email sent</p>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={async () => {
                  if (!email) {
                    setError('Enter your email first');
                    return;
                  }
                  setError('');
                  setResetSent(false);
                  try {
                    await sendPasswordResetEmail(getFirebaseAuth(), email);
                    setResetSent(true);
                  } catch {
                    setError('Failed to send reset email');
                  }
                }}
              >
                Forgot password?
              </button>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
}
