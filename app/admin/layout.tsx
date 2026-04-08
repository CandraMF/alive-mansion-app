'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const navItems = [
		{ name: 'Overview', path: '/admin' },
		{ name: 'Products', path: '/admin/products' },
		{ name: 'Orders', path: '/admin/orders' },
		{ name: 'Customers', path: '/admin/customers' },
		{ name: 'Settings', path: '/admin/settings' },
	];

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">

			{/* --- SIDEBAR (Desktop) / TOPBAR (Mobile) --- */}
			<aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col sticky top-0 md:h-screen z-20">

				{/* Logo Area */}
				<div className="p-6 border-b border-gray-200 flex items-center justify-between">
					<Link href="/" className="text-sm font-black uppercase tracking-widest text-black">
						ALIVE ADMIN
					</Link>
					{/* Hamburger Mobile (Sederhana) */}
					<button className="md:hidden text-2xl leading-none">&equiv;</button>
				</div>

				{/* Navigation Links */}
				<nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide">
					{navItems.map((item) => {
						const isActive = pathname === item.path;
						return (
							<Link
								key={item.name}
								href={item.path}
								className={`px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-md whitespace-nowrap transition-colors ${isActive
										? 'bg-black text-white'
										: 'text-gray-500 hover:bg-gray-100 hover:text-black'
									}`}
							>
								{item.name}
							</Link>
						);
					})}
				</nav>

				{/* Admin Profile Area */}
				<div className="p-4 border-t border-gray-200 hidden md:block">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">A</div>
						<div>
							<p className="text-xs font-bold">Admin</p>
							<p className="text-[10px] text-gray-500">admin@alivemansion.com</p>
						</div>
					</div>
				</div>
			</aside>

			{/* --- MAIN CONTENT AREA --- */}
			<main className="flex-1 overflow-y-auto">
				{/* Topbar minimalis (Desktop) */}
				<header className="bg-white h-16 border-b border-gray-200 hidden md:flex items-center px-8 justify-between sticky top-0 z-10">
					<h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Dashboard</h2>
					<button className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">
						Logout
					</button>
				</header>

				{/* Area di mana page.tsx akan di-render */}
				<div className="p-6 md:p-8">
					{children}
				</div>
			</main>

		</div>
	);
}