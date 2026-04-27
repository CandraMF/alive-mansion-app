'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred. Please try again.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in duration-700">
        
        <Link href="/register" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors mb-12">
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif italic text-black mb-4 uppercase tracking-widest">Check Your Email</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-8">
              We have sent a password reset link to <br/>
              <span className="text-black border-b border-black pb-0.5 mt-2 inline-block">{email}</span>
            </p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-12">
              You can close this page now.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-serif italic text-black mb-4 uppercase tracking-widest">Reset Password</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 leading-loose">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 text-[10px] font-bold uppercase tracking-widest text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 bg-gray-50 border border-gray-200 px-4 text-xs focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !email}
                className="w-full h-14 mt-4 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}