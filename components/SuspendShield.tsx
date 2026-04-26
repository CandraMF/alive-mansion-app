'use client';

import { useSession, signOut } from 'next-auth/react';
import { ShieldAlert } from 'lucide-react';

export default function SuspendShield() {
  const { data: session, status } = useSession();

  if (status === 'authenticated' && (session as any)?.isSuspended) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6">

          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tighter text-red-600">
              Account Suspended
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your access to Alive Mansion has been restricted by the administrator. Please contact our support team for further information.
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full bg-black text-white font-bold uppercase tracking-widest text-[10px] py-4 hover:bg-gray-800 transition-colors"
          >
            Acknowledge & Logout
          </button>
        </div>
      </div>
    );
  }

  return null;
}