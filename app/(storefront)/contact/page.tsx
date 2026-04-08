import Link from 'next/link';

export default function ContactPage() {
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

			{/* --- KOLOM 2: TENGAH (Formulir Kontak) --- */}
			<div className="w-full md:w-[55%] p-6 md:p-16 lg:p-24 flex flex-col justify-center">
				<h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12">
					CONTACT
				</h1>

				<form className="w-full max-w-xl flex flex-col gap-10">
					<div className="flex flex-col gap-3">
						<label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Name</label>
						<input
							type="text"
							className="w-full border-b border-gray-300 pb-2 text-sm outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
							placeholder="YOUR NAME"
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</label>
						<input
							type="email"
							className="w-full border-b border-gray-300 pb-2 text-sm outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
							placeholder="YOUR EMAIL"
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Number (Optional)</label>
						<input
							type="text"
							className="w-full border-b border-gray-300 pb-2 text-sm outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
							placeholder="#12345"
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Message</label>
						<textarea
							rows={4}
							className="w-full border-b border-gray-300 pb-2 text-sm outline-none focus:border-black transition-colors bg-transparent resize-none placeholder:text-gray-300"
							placeholder="HOW CAN WE HELP YOU?"
						></textarea>
					</div>

					<button
						type="button"
						className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors mt-2"
					>
						SUBMIT
					</button>
				</form>
			</div>

			{/* --- KOLOM 3: KANAN (Info CS & Jam Operasional) --- */}
			<div className="w-full md:w-[25%] p-6 md:p-10 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center gap-12">
				<div>
					<h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Customer Service</h3>
					<a
						href="mailto:help@alivemansion.com"
						className="text-xs md:text-sm text-gray-600 hover:text-black transition-colors underline-offset-4 hover:underline"
					>
						help@alivemansion.com
					</a>
				</div>

				<div>
					<h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Operational Hours</h3>
					<p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
						Monday - Friday<br />
						09:00 - 17:00 WIB
					</p>
				</div>
			</div>

		</main>
	);
}