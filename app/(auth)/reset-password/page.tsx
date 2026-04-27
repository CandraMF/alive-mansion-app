'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Jika URL tidak memiliki token atau token salah
  if (!token) {
    return (
      <div className="text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-serif italic text-black mb-4 uppercase tracking-widest">Invalid Link</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-8">
          This password reset link is missing or has expired.
        </p>
        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-black hover:opacity-50 transition-colors border-b border-black pb-1">
          Request New Link
        </Link>
      </div>
    );
  }

  // 2. Form Submission (Kirim password baru ke API)
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

  // 3. UI Status Sukses
  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-serif italic text-black mb-4 uppercase tracking-widest">Password Updated</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-12">
          Your password has been successfully reset. <br/> You can now log in with your new password.
        </p>
        <Link href="/register" className="w-full h-14 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-neutral-800 flex items-center justify-center">
          Go to Login
        </Link>
      </div>
    );
  }

  // 4. UI Default Reset Form
  return (
    <div className="animate-in fade-in duration-700 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-serif italic text-black mb-4 uppercase tracking-widest">Create New Password</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 leading-loose">
          Please enter your new password below. Make sure it's at least 6 characters.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-[10px] font-bold uppercase tracking-widest text-red-600 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 bg-gray-50 border border-gray-200 px-4 text-xs focus:outline-none focus:border-black focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 bg-gray-50 border border-gray-200 px-4 text-xs focus:outline-none focus:border-black focus:bg-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full h-14 mt-4 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  );
}

// 🚀 Membungkus komponen di dalam Suspense untuk mencegah error deopt useSearchParams di Next.js
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}