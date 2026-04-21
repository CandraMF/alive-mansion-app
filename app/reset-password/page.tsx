'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. If there's no token in the URL, block the user
  if (!token) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Invalid Link</h1>
        <p className="text-xs text-gray-500 leading-relaxed mb-6">
          This password reset link is missing or invalid.
        </p>
        <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-black hover:underline">
          Request New Link
        </Link>
      </div>
    );
  }

  // 2. Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Success state UI
  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Password Updated</h1>
        <p className="text-xs text-gray-500 leading-relaxed mb-8">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Link href="/register" className="block">
          <Button className="w-full h-11 bg-black hover:bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] transition-all">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  // 4. Default Reset Form UI
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Create New Password</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Please enter your new password below. Make sure it's at least 6 characters.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white text-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-4 bg-black hover:bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
        </Button>
      </form>
    </>
  );
}

// 🚀 Wrapping the entire page in Suspense to safely use `useSearchParams`
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}