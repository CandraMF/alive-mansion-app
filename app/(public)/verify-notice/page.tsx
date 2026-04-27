'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { MailWarning, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function VerifyNoticePage() {
  const { data: session } = useSession();
  
  // State Management
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

  // 🚀 1. CEK STATUS COOLDOWN SAAT HALAMAN DIBUKA (Persistence)
  useEffect(() => {
    const checkStatus = async () => {
      if (!session?.user?.email) return;

      try {
        // Kita asumsikan ada endpoint GET /api/verify/resend untuk cek status saja
        const res = await fetch(`/api/verify/resend?email=${session.user.email}`);
        const data = await res.json();
        
        if (data.secondsLeft > 0) {
          setTimeLeft(data.secondsLeft);
        }
      } catch (error) {
        console.error("Failed to sync cooldown status");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [session]);

  // 🚀 2. EFEK TIMER: Menjalankan hitung mundur jika timeLeft > 0
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🚀 3. FUNGSI KIRIM ULANG EMAIL
  const handleResend = async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });

      const data = await res.json();

      if (res.status === 429) {
        // 🛡️ Jika Server menolak karena Cooldown (Database Check)
        setStatusMsg({ type: 'error', text: data.error });
        if (data.secondsLeft) setTimeLeft(data.secondsLeft);
      } else if (res.ok) {
        // ✅ Berhasil kirim ulang
        setStatusMsg({ type: 'success', text: 'Verification email has been resent!' });
        setTimeLeft(60); 
      } else {
        // ❌ Error lainnya
        setStatusMsg({ type: 'error', text: data.error || 'Failed to resend email.' });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'An error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-700 pt-20">
      {/* Icon Section */}
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
        <MailWarning className="w-10 h-10 text-black" />
      </div>
      
      {/* Text Content */}
      <h1 className="text-3xl font-serif italic mb-4 uppercase tracking-widest text-center text-black">
        Action Required
      </h1>
      
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 text-center max-w-md leading-loose">
        To ensure the security of your transactions, please verify your email address before accessing the checkout or account area. 
        <br /><br />
        We have sent a verification link to: <br />
        <span className="text-black font-black border-b border-black pb-0.5">
          {session?.user?.email || 'your email'}
        </span>
      </p>

      {/* Status Notifications */}
      {statusMsg.text && (
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-8 px-6 py-3 border rounded-sm transition-all animate-in zoom-in-95
          ${statusMsg.type === 'success' 
            ? 'text-green-600 bg-green-50 border-green-100' 
            : 'text-red-600 bg-red-50 border-red-100'}`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMsg.text}
        </div>
      )}

      {/* Buttons Container */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        
        {/* Tombol Resend dengan Sinkronisasi Loading & Cooldown */}
        <button 
          onClick={handleResend}
          disabled={timeLeft > 0 || isLoading || isCheckingStatus || !session?.user?.email}
          className="flex-1 bg-black text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent"
        >
          {isCheckingStatus ? (
             <><RefreshCw className="w-3 h-3 animate-spin" /> Syncing Status...</>
          ) : isLoading ? (
            <><RefreshCw className="w-3 h-3 animate-spin" /> Processing...</>
          ) : timeLeft > 0 ? (
            `Resend Available in ${timeLeft}s`
          ) : (
            'Resend Verification Email'
          )}
        </button>

        <Link 
          href="/"
          className="flex-1 bg-white text-black border border-black px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all text-center"
        >
          Back to Home
        </Link>
        
      </div>

      <p className="mt-12 text-[9px] uppercase tracking-widest text-gray-400">
        Check your spam folder if you don't see the email.
      </p>
    </div>
  );
}