'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
	id: string;
	name: string;
	price: string;
	images: string[];
	status: string;
}

export default function RelatedProductCard({ product }: { product: Product }) {
	const [currentImgIndex, setCurrentImgIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		let loopTimeout: NodeJS.Timeout;
		let autoPlayInterval: NodeJS.Timeout;

		if (isHovered && product.images.length > 1) {
			// 1. TAHAN (Hold Delay)
			// Tahan di gambar kedua (index 1) selama 2000ms (2 detik)
			loopTimeout = setTimeout(() => {
				// 2. PUTAR (Loop Play)
				// Mulai putar otomatis setiap 1500ms
				autoPlayInterval = setInterval(() => {
					setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
				}, 1500);
			}, 2000);
		} else {
			// 3. RESET
			// Jika kursor keluar, kembalikan ke gambar pertama
			setCurrentImgIndex(0);
		}

		// Bersihkan timer saat kursor keluar atau komponen hancur
		return () => {
			clearTimeout(loopTimeout);
			clearInterval(autoPlayInterval);
		};
	}, [isHovered, product.images.length]);

	return (
		<Link
			href={`/shop/${product.id}`}
			className="group flex flex-col cursor-pointer"
			onMouseEnter={() => {
				// INSTAN GANTI GAMBAR (Warna/Varian Lain)
				if (product.images.length > 1) {
					setCurrentImgIndex(1);
				}
				setIsHovered(true);
			}}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Container Gambar (Kotak - Rasio 1:1 ala Mankind) */}
			<div className="aspect-square w-full relative bg-gray-50 overflow-hidden">
				{product.images.map((imgUrl, idx) => (
					<Image
						key={idx}
						src={imgUrl}
						alt={`${product.name} - View ${idx + 1}`}
						fill
						className={`object-cover object-center transition-opacity duration-300 ease-in-out ${currentImgIndex === idx ? 'opacity-100' : 'opacity-0'
							}`}
						priority={idx < 2} // Prioritaskan render 2 gambar pertama
					/>
				))}

				{/* Status Sold Out (Opsional) */}
				{product.status === 'sold_out' && (
					<div className="absolute top-2 right-2 bg-gray-200 text-gray-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-sm">
						Sold Out
					</div>
				)}
			</div>

			{/* Info Produk Minimalis */}
			<div className="mt-4 text-left">
				<h3 className="text-[11px] md:text-xs font-bold text-black uppercase tracking-[0.15em] mb-1 line-clamp-1">
					{product.name}
				</h3>
				<p className="text-[11px] md:text-xs font-medium text-gray-500">
					{product.price}
				</p>
			</div>
		</Link>
	);
}