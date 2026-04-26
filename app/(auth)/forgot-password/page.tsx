'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        
        <Link href="/register" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>

        {isSuccess ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              We have sent a password reset link to <br/>
              <span className="font-bold text-black">{email}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Reset Password</h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="hello@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 mt-4 bg-black hover:bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}