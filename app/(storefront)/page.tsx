import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LoadingScreen from '@/components/LoadingScreen';

// --- IMPORT KOMPONEN UNIVERSAL KITA ---
// Komponen yang sama persis dengan yang dipakai di halaman Admin Preview!
import HeroVideoBlock from '@/components/blocks/HeroVideoBlock';
import EditorialSplitBlock from '@/components/blocks/EditorialSplitBlock';
import HeroSplitImageBlock from '@/components/blocks/HeroSplitImageBlock';
import ProductCarouselBlock from '@/components/blocks/ProductCarouselBlock';
import NewsletterBlock from '@/components/blocks/NewsletterBlock';

// ==========================================
// CACHING STRATEGY (Fitur Keren Next.js)
// ==========================================
// Halaman akan di-cache selama 60 detik. 
// Artinya: Jutaan pengunjung akan merasakan load time milidetik tanpa membebani database PostgreSQL.
// Jika admin mempublikasikan perubahan, pengunjung di menit berikutnya akan melihat versi terbaru.
export const revalidate = 60; 

export default async function HomePage() {
  
  // 1. Ambil data Halaman 'home' beserta seluruh Section & Block-nya dari PostgreSQL
  const page = await prisma.page.findUnique({
    where: { 
      slug: 'home' 
      // isPublished: true // Aktifkan ini jika Anda ingin menyembunyikan draft
    },
    include: {
      sections: {
        orderBy: { position: 'asc' }, // Urutkan seksi sesuai yang disusun admin
        include: { 
          blocks: { 
            orderBy: { position: 'asc' } // Urutkan komponen di dalam seksi
          } 
        }
      }
    }
  });

  // 2. Handle jika halaman belum dibuat di CMS
  if (!page || page.sections.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <LoadingScreen />
        <div className="max-w-md space-y-4">
           <h1 className="text-xl font-serif italic text-gray-900">Alive Mansion</h1>
           <p className="text-xs tracking-widest uppercase font-bold text-gray-400">Pemberitahuan Sistem</p>
           <p className="text-sm text-gray-500">
             Halaman beranda belum dikonfigurasi. Silakan masuk ke panel Admin (CMS) untuk menyusun tata letak dan konten halaman ini.
           </p>
        </div>
      </main>
    );
  }

  // 3. Render Mesin Utama
  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      
      {/* Efek Loading Estetik Bawaan Anda */}
      <LoadingScreen />

      {/* Mesin Looping Section & Block */}
      {page.sections.map((section) => (
        <div 
          key={section.id} 
          // Aturan layout Container vs Full Width dari Admin
          className={`
            ${section.layout === 'FULL_WIDTH' ? 'w-full' : 'max-w-7xl mx-auto'} 
            ${section.paddingY !== 'py-0' ? section.paddingY : ''} 
            ${section.background || ''}
          `}
        >
          {section.blocks.map((block) => {
            
            // PROPS UNTUK HALAMAN PUBLIK
            const blockProps = {
              key: block.id,
              data: block.content, // Data JSON dari database
              
              // CRITICAL LOGIC: 
              // Kita mengirim isCms={false}. 
              // Hal ini akan mematikan fitur 'contentEditable' dan outline biru,
              // sehingga komponen murni menjadi tag HTML statis biasa (<a>, <h2>, dll).
              isCms: false, 
            };

            // Switcher untuk merender komponen sesuai tipenya
            switch (block.type) {
              case 'HERO_VIDEO': 
                return <HeroVideoBlock {...blockProps} />;
              case 'EDITORIAL_SPLIT': 
                return <EditorialSplitBlock {...blockProps} />;
              case 'HERO_SPLIT_IMAGE': 
                return <HeroSplitImageBlock {...blockProps} />;
              case 'PRODUCT_CAROUSEL': 
                return <ProductCarouselBlock {...blockProps} />;
              case 'NEWSLETTER': 
                return <NewsletterBlock {...blockProps} />;
              
              default: 
                console.warn(`[CMS Warning] Block type ${block.type} tidak ditemukan.`);
                return null;
            }
          })}
        </div>
      ))}

    </main>
  );
}