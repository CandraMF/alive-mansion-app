import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="px-6 md:px-10 py-12 border-border">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					<div>
						<p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">Client Care</p>
						<ul className="space-y-2">
							{["Contact Us", "FAQs", "Packaging", "Repair Icon", "Shipping", "Boutiques"].map((item) => (
								<li key={item}>
									<a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
										{item}
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">Legal Information</p>
						<ul className="space-y-2">
							{["Terms", "Privacy", "Cookies", "Accessibility Statement"].map((item) => (
								<li key={item}>
									<a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
										{item}
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">Language</p>
						<button className="text-xs text-muted-foreground border border-border px-3 py-1.5">
							English
						</button>
					</div>
					<div>
						<p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">Follow Us</p>
						<div className="flex gap-3">
							{["IG", "X", "FB", "TW"].map((s) => (
								<a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
									{s}
								</a>
							))}
						</div>
					</div>
				</div>
				<div className="text-center border-border pt-8">
					<p className="font-serif text-sm tracking-wider mb-4">Alive Mansion</p>
					<p className="text-[10px] text-muted-foreground">
						Copyright © 2026 — v1.0
					</p>
				</div>
			</div>
		</footer>
	);
}