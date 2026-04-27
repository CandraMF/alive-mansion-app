'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Mail, Lock, User, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

// 1. PISAHKAN SEMUA LOGIKA KE DALAM KOMPONEN ANAK (CHILD COMPONENT)
function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 🚀 STATE BARU UNTUK LAYAR SUKSES
  const [isSuccessRegistration, setIsSuccessRegistration] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        const res = await signIn('credentials', { email, password, redirect: false });
        if (res?.error) {
          setError("Invalid email or password.");
          setIsLoading(false);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        // --- PROSES REGISTRASI ---
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
          // 🚀 JIKA SUKSES, SIMPAN REWARD DAN TAMPILKAN LAYAR SELAMAT
          setRewardData(data.reward);
          setIsSuccessRegistration(true);

          // Login di latar belakang agar sesi langsung aktif
          await signIn('credentials', { email, password, redirect: false });
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 TAMPILAN LAYAR SUKSES DAPAT VOUCHER
  // ==========================================
  if (isSuccessRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <CheckCircle2 className="w-16 h-16 text-green-500 relative z-10" />
            </div>
          </div>

          <h1 className="text-3xl font-serif italic text-gray-900 mb-2">Welcome to Alive!</h1>
          <p className="text-xs text-gray-500 leading-relaxed mb-8">
            Your account has been created successfully.
          </p>

          {/* Kartu Hadiah (Hanya muncul jika ada hadiah dari Backend) */}
          {rewardData && (
            <div className="bg-black text-white p-6 rounded-xl mb-8 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Ticket className="w-24 h-24" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Exclusive Reward Unlocked</p>
              <h2 className="text-xl font-bold mb-1">{rewardData.name}</h2>
              <p className="text-xs text-gray-300">
                {rewardData.type === 'PERCENTAGE' ? `${rewardData.value}% OFF` :
                  rewardData.type === 'NOMINAL' ? `IDR ${rewardData.value.toLocaleString('id-ID')}` : 'FREE SHIPPING'}
              </p>
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                <span className="text-[10px] text-gray-400">VOUCHER CODE</span>
                <span className="font-mono text-sm tracking-widest bg-white/20 px-3 py-1 rounded">{rewardData.code}</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              router.push(callbackUrl);
              router.refresh();
            }}
            className="w-full h-12 bg-black hover:bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] transition-all group"
          >
            {rewardData ? 'Claim & Continue Shopping' : 'Continue Shopping'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {rewardData && (
            <p className="text-[9px] text-gray-400 mt-4 uppercase tracking-widest">
              You can view this voucher anytime in your Account dashboard.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN DEFAULT LOGIN / REGISTER
  // ==========================================
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

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-11 relative font-bold text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-all text-xs"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 absolute left-4" />
          Continue with Google
        </Button>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
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

// 2. EXPORT DEFAULT COMPONENT YANG MEMBUNGKUS CONTENT DENGAN SUSPENSE
export default function CustomerAuthPage() {
  return (
    // Fallback UI akan muncul sementara Next.js membaca parameter URL
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <CustomerAuthContent />
    </Suspense>
  );
}