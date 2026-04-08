'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface ProductColor {
	name: string;
	hexCode: string;
}

interface Product {
	id: number;
	name: string;
	price: string;
	colors: ProductColor[];
	images: Record<string, string[]>;
	description: string;
}

interface ProductModalProps {
	product: Product | null;
	isOpen: boolean;
	onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [openAccordion, setOpenAccordion] = useState<string | null>('details');

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const lastScrollTime = useRef(0);
	const [touchStart, setTouchStart] = useState(0);

	const currentImages = product && selectedColor && product.images[selectedColor]
		? product.images[selectedColor]
		: product ? product.images[product.colors[0].name] : [];

	// FIX: Dependency array diubah menjadi product?.id agar tidak error
	useEffect(() => {
		if (isOpen && product) {
			document.body.style.overflow = 'hidden';
			setSelectedColor(product.colors[0].name);
			setSelectedSize(null);
			setOpenAccordion('details');
			setCurrentImageIndex(0);
		} else {
			document.body.style.overflow = 'unset';
		}
	}, [isOpen, product?.id]);

	const handleColorChange = (colorName: string) => {
		setSelectedColor(colorName);
		setCurrentImageIndex(0);
	};

	if (!isOpen || !product) return null;

	const toggleAccordion = (section: string) => {
		setOpenAccordion(openAccordion === section ? null : section);
	};

	const isReadyToAddToCart = selectedSize && selectedColor;

	// --- KONTROL SCROLL CAROUSEL ---
	const handleWheel = (e: React.WheelEvent) => {
		const now = new Date().getTime();
		if (now - lastScrollTime.current < 800) return;

		if (e.deltaY > 20) {
			if (currentImageIndex < currentImages.length - 1) {
				setCurrentImageIndex(prev => prev + 1);
				lastScrollTime.current = now;
			}
		} else if (e.deltaY < -20) {
			if (currentImageIndex > 0) {
				setCurrentImageIndex(prev => prev - 1);
				lastScrollTime.current = now;
			}
		}
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientY);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		const now = new Date().getTime();
		if (now - lastScrollTime.current < 800) return;

		const touchEnd = e.touches[0].clientY;
		const delta = touchStart - touchEnd;

		if (delta > 50) {
			if (currentImageIndex < currentImages.length - 1) {
				setCurrentImageIndex(prev => prev + 1);
				lastScrollTime.current = now;
			}
		} else if (delta < -50) {
			if (currentImageIndex > 0) {
				setCurrentImageIndex(prev => prev - 1);
				lastScrollTime.current = now;
			}
		}
	};

	return (
		<div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-full duration-500 overflow-hidden">

			<button
				onClick={onClose}
				className="absolute top-6 left-6 z-[110] text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors bg-white/80 backdrop-blur px-2 py-1 md:bg-transparent md:px-0"
			>
				[ CLOSE ]
			</button>

			{/* --- KOLOM 1: KIRI (Nama, Harga, Accordion UTUH & Tabel Sizing) --- */}
			<div className="w-full md:w-[30%] lg:w-[25%] h-auto md:h-screen flex flex-col justify-center bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 md:p-10 z-10 pt-20 md:pt-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-3">
					{product.name}
				</h1>
				<p className="text-sm font-bold mb-8 text-gray-500">
					{product.price}
				</p>

				<div className="border-t border-gray-200 w-full">

					{/* 1. Accordion: Product Detail */}
					<div className="border-b border-gray-200">
						<button onClick={() => toggleAccordion('details')} className="w-full py-4 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest hover:text-gray-500">
							<span>Product Detail</span>
							<span className="text-lg font-light leading-none">{openAccordion === 'details' ? '-' : '+'}</span>
						</button>
						<div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'details' ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
							<p className="text-xs text-gray-600 leading-relaxed font-light">{product.description}</p>
						</div>
					</div>

					{/* 2. Accordion: Sizing Guide (BERBENTUK TABEL SIMPLE) */}
					<div className="border-b border-gray-200">
						<button onClick={() => toggleAccordion('sizing')} className="w-full py-4 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest hover:text-gray-500">
							<span>Sizing Guide</span>
							<span className="text-lg font-light leading-none">{openAccordion === 'sizing' ? '-' : '+'}</span>
						</button>
						<div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'sizing' ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>

							{/* Tabel Sizing Minimalis */}
							<table className="w-full text-[10px] md:text-[11px] uppercase tracking-widest text-left mt-2">
								<thead>
									<tr className="border-b border-gray-300 text-gray-400">
										<th className="py-2 font-bold w-1/3">Size</th>
										<th className="py-2 font-bold w-1/3">Width</th>
										<th className="py-2 font-bold w-1/3">Length</th>
									</tr>
								</thead>
								<tbody className="text-gray-600 font-medium">
									<tr className="border-b border-gray-100">
										<td className="py-2.5">S</td>
										<td className="py-2.5">50 cm</td>
										<td className="py-2.5">70 cm</td>
									</tr>
									<tr className="border-b border-gray-100">
										<td className="py-2.5">M</td>
										<td className="py-2.5">53 cm</td>
										<td className="py-2.5">72 cm</td>
									</tr>
									<tr className="border-b border-gray-100">
										<td className="py-2.5">L</td>
										<td className="py-2.5">56 cm</td>
										<td className="py-2.5">74 cm</td>
									</tr>
									<tr className="border-b border-gray-100">
										<td className="py-2.5">XL</td>
										<td className="py-2.5">59 cm</td>
										<td className="py-2.5">76 cm</td>
									</tr>
								</tbody>
							</table>

						</div>
					</div>

					{/* 3. Accordion: Term & Condition */}
					<div className="border-b border-gray-200">
						<button onClick={() => toggleAccordion('tnc')} className="w-full py-4 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest hover:text-gray-500">
							<span>Term & Condition</span>
							<span className="text-lg font-light leading-none">{openAccordion === 'tnc' ? '-' : '+'}</span>
						</button>
						<div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'tnc' ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
							<p className="text-xs text-gray-600 leading-relaxed font-light">
								Barang yang sudah dibeli tidak dapat ditukar kecuali ada cacat produksi. Wajib menyertakan video unboxing maksimal 2x24 jam sejak barang diterima.
							</p>
						</div>
					</div>

				</div>
			</div>

			{/* --- KOLOM 2: TENGAH (CAROUSEL GAMBAR PRESISI) --- */}
			<div
				className="w-full md:w-[40%] lg:w-[50%] h-[60vh] md:h-screen relative overflow-hidden bg-gray-50 flex-shrink-0 touch-none"
				onWheel={handleWheel}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
			>
				<div
					className="w-full h-full transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
					style={{ transform: `translateY(-${currentImageIndex * 100}%)` }}
				>
					{currentImages.map((imgUrl, idx) => (
						<div key={idx} className="h-full w-full relative">
							<Image
								src={imgUrl}
								alt={`${product.name} - ${selectedColor} view ${idx + 1}`}
								fill
								className="object-cover object-center"
								priority={idx === 0}
							/>
						</div>
					))}
				</div>

				<div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
					{currentImages.map((_, idx) => (
						<div
							key={idx}
							className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentImageIndex === idx ? 'bg-black h-4' : 'bg-gray-300'
								}`}
						/>
					))}
				</div>
			</div>

			{/* --- KOLOM 3: KANAN (Aksi Pembelian) --- */}
			<div className="w-full md:w-[30%] lg:w-[25%] h-auto md:h-screen flex flex-col justify-center bg-white md:border-l border-gray-200 p-6 md:p-10 z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

				{/* Color Selection */}
				<div className="mb-8">
					<div className="flex justify-between items-center mb-4">
						<span className="text-[11px] font-bold uppercase tracking-widest">Color : {selectedColor || '-'}</span>
					</div>
					<div className="flex gap-3">
						{product.colors.map((color) => (
							<button
								key={color.name}
								onClick={() => handleColorChange(color.name)}
								className={`w-10 h-10 border transition-all duration-200 ${selectedColor === color.name
										? 'border-black scale-110 shadow-md'
										: 'border-gray-200 hover:border-gray-400'
									}`}
								style={{ backgroundColor: color.hexCode }}
								title={color.name}
							/>
						))}
					</div>
				</div>

				{/* Size Selection */}
				<div className="mb-12">
					<div className="flex justify-between items-center mb-4">
						<span className="text-[11px] font-bold uppercase tracking-widest">Size : {selectedSize || '-'}</span>
					</div>
					<div className="grid grid-cols-4 gap-2">
						{['S', 'M', 'L', 'XL'].map((size) => (
							<button
								key={size}
								onClick={() => setSelectedSize(size)}
								className={`py-3 border text-xs font-bold transition-all duration-200 ${selectedSize === size
										? 'bg-black text-white border-black'
										: 'bg-white text-black border-gray-300 hover:border-black'
									}`}
							>
								{size}
							</button>
						))}
					</div>
				</div>

				{/* Button Add to Bag */}
				<button
					className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
					disabled={!isReadyToAddToCart}
				>
					{isReadyToAddToCart ? 'ADD TO BAG' : 'SELECT COLOR & SIZE'}
				</button>
			</div>

		</div>
	);
}