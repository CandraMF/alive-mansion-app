import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data';

export default function ShopPage() {
	return (
		<main className="min-h-screen bg-white pt-24 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">

			{/* Header Halaman */}
			<div className="mb-12 text-center md:text-left">
				<h1 className="text-2xl md:text-4xl font-normal uppercase tracking-widest mb-2">Shop All</h1>
				<p className="text-xs text-gray-500 uppercase tracking-widest">{products.length} Products</p>
			</div>

			{/* Grid Produk - Layout ala Mankind (Kotak-kotak rapi) */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>

		</main>
	);
}