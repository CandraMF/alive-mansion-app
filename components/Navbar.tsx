'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
	const [isNavVisible, setIsNavVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY > lastScrollY && currentScrollY > 50) {
				setIsNavVisible(false);
			} else {
				setIsNavVisible(true);
			}
			setLastScrollY(currentScrollY);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);

	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
	}, [isMenuOpen]);

	return (
		<>
			<header
				className={`fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-transform duration-500 ease-in-out ${isNavVisible ? 'translate-y-0' : '-translate-y-full'
					}`}
			>
				<nav className="flex justify-between items-center px-6 py-5 md:px-12 max-w-[1600px] mx-auto">
					<div className="flex-1">
						<button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 focus:outline-none hover:opacity-60 flex flex-col gap-[5px]" aria-label="Menu">
							<div className="w-6 h-[1px] bg-black"></div>
							<div className="w-6 h-[1px] bg-black"></div>
						</button>
					</div>
					<div className="flex-1 text-center">
						<Link href="/" className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase whitespace-nowrap">
							Alive Mansion
						</Link>
					</div>
					<div className="flex-1 flex justify-end gap-4 md:gap-8 text-[10px] md:text-xs uppercase tracking-widest font-light">
						<button className="hover:opacity-50 transition-opacity hidden md:block">Search</button>
						<Link href="#" className="hover:opacity-50 transition-opacity hidden md:block">Account</Link>
						<Link href="#" className="hover:opacity-50 transition-opacity">My Bag</Link>
					</div>
				</nav>
			</header>
			<div className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMenuOpen(false)} />
			<div className={`fixed top-0 left-0 h-full w-[80vw] md:w-[400px] bg-white z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				<div className="px-8 py-6 flex justify-between items-center border-b border-gray-100">
					<span className="text-xs uppercase tracking-widest font-medium">Menu</span>
					<button onClick={() => setIsMenuOpen(false)} className="text-2xl font-light hover:opacity-50 transition-opacity">&times;</button>
				</div>
				<div className="flex flex-col gap-6 p-8 text-lg font-light tracking-wide uppercase">
					<Link href="/" className="hover:translate-x-2 transition-transform">HOME</Link>
					<Link href="/shop" className="hover:translate-x-2 transition-transform">SHOP</Link>
					<Link href="/about" className="hover:translate-x-2 transition-transform">ABOUT</Link>
					<Link href="/contact" className="hover:translate-x-2 transition-transform">CONTACT</Link>
				</div>
				<div className="mt-auto p-8 border-t border-gray-100 flex flex-col gap-4 text-xs font-light tracking-widest md:hidden uppercase">
					<Link href="#">Search</Link>
					<Link href="#">Account</Link>
				</div>
			</div>
		</>
	);
}