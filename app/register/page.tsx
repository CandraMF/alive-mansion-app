'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

export default function CustomerAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🚀 Tangkap URL sebelumnya. Jika tidak ada, default ke home (/)
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // State untuk mengatur apakah sedang di mode Login atau Register
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 🚀 Fungsi Login dengan Google (Sekarang menggunakan callbackUrl)
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  // Fungsi Handle Submit (Bisa untuk Login atau Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // --- PROSES LOGIN MANUAL ---
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Email atau password salah.");
          setIsLoading(false);
        } else {
          // 🚀 Kembali ke halaman produk (atau home) setelah login sukses
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        // --- PROSES REGISTRASI AKUN BARU ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          setIsLoading(false);
        } else {
          // 🚀 Jika registrasi berhasil, otomatis langsung Login dan kembali ke halaman sebelumnya!
          await signIn('credentials', {
            email,
            password,
            callbackUrl,
          });
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif italic text-gray-900 mb-2">Welcome to Alive</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            {isLoginMode ? 'Log in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Input Nama (Hanya muncul jika mode Register) */}
          {!isLoginMode && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginMode}
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white text-sm"
                />
              </div>
            </div>
          )}

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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Password</Label>
              {isLoginMode && (
                <Link href="/forgot-password" className="text-[9px] font-bold text-gray-400 hover:text-black hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-black hover:bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLoginMode ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-[9px] uppercase font-bold text-gray-400 tracking-widest">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* TOMBOL GOOGLE */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-11 relative font-bold text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-all text-xs"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 absolute left-4" />
          Continue with Google
        </Button>

        {/* Toggle Login/Register Mode */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button" // 🚀 Penyelamat form, mencegah auto-submit!
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="font-bold text-black hover:underline ml-1"
            >
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}