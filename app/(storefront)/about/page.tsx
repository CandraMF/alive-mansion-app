import Link from 'next/link';

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-white flex flex-col md:flex-row border-t border-gray-200">

			{/* --- KOLOM 1: KIRI (Navigasi) --- */}
			<div className="w-full md:w-[20%] p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-start pt-10 md:pt-20">
				<Link
					href="/"
					className="text-[11px] font-bold uppercase tracking-[0.1em] hover:text-gray-500 transition-colors flex items-center gap-2 w-fit"
				>
					&lt; HOME
				</Link>
			</div>

			{/* --- KOLOM 2: TENGAH (Konten Info) --- */}
			<div className="w-full md:w-[55%] p-6 md:p-16 lg:p-24 flex flex-col justify-center">
				<h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12">
					INFO
				</h1>
				<div className="prose prose-sm md:prose-base text-gray-800 font-light leading-relaxed space-y-6">
					<p>
						Alive Mansion is a conceptual approach to modern utility and structural aesthetics.
						We focus on exploring the boundaries of form, negative space, and functional design.
					</p>
					<p>
						Each collection is an ongoing dialogue between raw materials and precise tailoring,
						aiming to create garments that transcend seasonal trends and exist as timeless
						architectural pieces for the human body.
					</p>
					<p>
						Founded in Jakarta, Indonesia in 2024.
					</p>
				</div>
			</div>

			{/* --- KOLOM 3: KANAN (Tautan / Sidebar) --- */}
			<div className="w-full md:w-[25%] p-6 md:p-10 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center gap-6">
				<Link href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors w-fit">
					STOCKISTS
				</Link>
				<Link href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors w-fit">
					CAREERS
				</Link>
				<Link href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors w-fit">
					TERMS & CONDITIONS
				</Link>
				<Link href="#" className="text-[11px] font-bold uppercase tracking-widest hover:text-gray-500 transition-colors w-fit">
					PRIVACY POLICY
				</Link>
			</div>

		</main>
	);
}