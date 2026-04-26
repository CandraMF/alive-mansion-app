export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import ShopFilterUI from '@/components/ShopFilterUI'; // 🚀 Import new UI

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string, category?: string, sizes?: string, colors?: string }> 
}) {
  const { search, category, sizes, colors } = await searchParams;

  // 1. Fetch available filters for the UI
  const [allCategories, allColors, allSizes] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.color.findMany({ orderBy: { name: 'asc' } }),
    prisma.size.findMany({ orderBy: { sortOrder: 'asc' } })
  ]);

  // 2. Build the Prisma Where Clause
  const where: any = {
    status: 'PUBLISHED',
    variants: { some: { isArchived: false } }
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // 3. Category Tree Resolution Logic
  let currentCategoryHierarchy: any[] = [];
  
  if (category) {
    const selectedCat = allCategories.find(c => c.slug === category);
    if (selectedCat) {
      // Find all child category IDs (recursive-friendly approach)
      const getChildIds = (parentId: string): string[] => {
        const children = allCategories.filter(c => c.parentId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(c => { ids = [...ids, ...getChildIds(c.id)]; });
        return ids;
      };

      const categoryIds = [selectedCat.id, ...getChildIds(selectedCat.id)];
      where.categoryId = { in: categoryIds };

      // Build the breadcrumb hierarchy (from root to current child)
      let curr: any = selectedCat;
      while (curr) {
        currentCategoryHierarchy.unshift(curr);
        curr = allCategories.find(c => c.id === curr.parentId);
      }
    }
  }

  // 4. Variant Filters (Size & Color)
  const variantConditions: any = { isArchived: false };
  
  if (sizes) {
    variantConditions.sizeId = { in: sizes.split(',') };
  }
  if (colors) {
    variantConditions.colorId = { in: colors.split(',') };
  }

  // Apply variant conditions if any filter is active
  if (sizes || colors) {
    where.variants.some = { ...where.variants.some, ...variantConditions };
  }

  // 5. Fetch Final Products
  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: {
        where: { isArchived: false },
        include: { color: true }
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-[1600px] mx-auto px-6 animate-in fade-in duration-500 ">
      
      {/* 🚀 Render the new Client-side Filter UI */}
      <ShopFilterUI 
        categories={allCategories}
        colors={allColors}
        sizes={allSizes}
        currentCategoryHierarchy={currentCategoryHierarchy}
        totalProducts={products.length}
      />

      {/* Grid Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
        {products.map((product) => {
          const isSoldOut = product.variants.length > 0 && !product.variants.some(v => v.stock > 0);
          const basePrice = product.variants[0]?.price || 0;

          const colorsMap = new Map();
          product.variants.forEach((v: any) => {
            const colorObj = v.color || { id: v.colorId || 'default', name: 'Default', hexCodes: ['#000000'] };
            if (!colorsMap.has(colorObj.id)) {
              let hexes = ['#000000'];
              if (Array.isArray(colorObj.hexCodes) && colorObj.hexCodes.length > 0) hexes = colorObj.hexCodes;
              colorsMap.set(colorObj.id, {
                id: colorObj.id,
                name: colorObj.name || 'Unknown',
                hexCodes: hexes
              });
            }
          });
          const allColors = Array.from(colorsMap.values());

          return (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: formatRupiah(basePrice),
                images: product.images.map(img => img.url),
                status: isSoldOut ? 'sold_out' : 'available',
                allColors: allColors 
              }}
            />
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="py-32 text-center border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            No products match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}