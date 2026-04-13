'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Tags,
  Ruler,
  Palette,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // PERUBAHAN 1: Struktur data diubah menjadi bentuk Grup
  const navGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Catalog',
      items: [
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Tags },
        { name: 'Sizes', path: '/admin/sizes', icon: Ruler },
        { name: 'Colors', path: '/admin/colors', icon: Palette },
      ]
    },
    {
      label: 'Sales',
      items: [
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', path: '/admin/customers', icon: Users },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  // Fungsi helper untuk mendapatkan nama halaman saat ini (untuk di Topbar)
  const getCurrentPageName = () => {
    for (const group of navGroups) {
      const found = group.items.find(item => item.path === pathname);
      if (found) return found.name;
    }
    return 'Dashboard';
  };

  // PERUBAHAN 2: Fungsi render di-update untuk me-looping grup
  const renderNavLinks = (isMobile = false) => (
    <nav className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto no-scrollbar">
      {navGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col gap-1.5">
          {/* Label Grup */}
          <span className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">
            {group.label}
          </span>

          {/* Item di dalam Grup */}
          {group.items.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-md",
                  isActive ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("w-[18px] h-[18px] mr-3 transition-transform duration-200", isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900")}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50/50 flex flex-col md:flex-row", inter.className)}>

      {/* --- MOBILE: TOPBAR & DRAWER --- */}
      <div className="md:hidden flex items-center justify-between bg-white h-16 px-4 border-b border-gray-200 sticky top-0 z-30">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          Alive Admin
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-900 focus:outline-none p-2">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div
        className={cn("fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden", isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-lg font-bold tracking-tight text-gray-900">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavLinks(true)}

        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50">
          <button className="flex items-center gap-3 w-full text-sm font-medium text-red-600 hover:text-red-700 transition-colors p-2 rounded-md hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* --- DESKTOP: SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen z-20 shrink-0">
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
            Alive Admin
          </Link>
        </div>

        {renderNavLinks(false)}

        <div className="p-4 mx-3 mb-3 border border-gray-100 rounded-lg shrink-0 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar className="w-9 h-9 rounded-md">
              <AvatarFallback className="bg-gray-100 text-sm font-semibold text-gray-900">AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-900 leading-none mb-1 truncate">Admin User</span>
              <span className="text-xs font-normal text-gray-500 leading-none truncate">admin@alive.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className="bg-white/80 backdrop-blur-md h-16 border-b border-gray-200 hidden md:flex items-center px-10 justify-between sticky top-0 z-10">
          <span className="text-sm font-semibold text-gray-900">
            {getCurrentPageName()}
          </span>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors group px-3 py-2 rounded-md hover:bg-red-50">
            Logout
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        <div className="p-4 md:p-10 text-gray-900">
          {children}
        </div>
      </main>

    </div>
  );
}