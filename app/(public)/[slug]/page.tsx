import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import PublicRenderer from '@/components/cms/PublicRenderer';
import { prisma } from '@/lib/prisma';

// ==========================================
// 1. DIRECT DATABASE QUERY (Aman & Super Cepat)
// ==========================================
async function getPageData(slug: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });

    return page;
  } catch (e) {
    console.error("Database Query Error:", e);
    return null;
  }
}

// ==========================================
// 2. GENERATE METADATA SEO
// ==========================================
type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) {
    return { title: 'Page Not Found' };
  }

  return {
    title: pageData.metaTitle || pageData.title || 'Alive Mansion',
    description: pageData.metaDescription || 'Discover our latest collections.',
    openGraph: {
      title: pageData.metaTitle || pageData.title,
      description: pageData.metaDescription || '',
      images: pageData.ogImage ? [pageData.ogImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle || pageData.title,
      description: pageData.metaDescription || '',
      images: pageData.ogImage ? [pageData.ogImage] : [],
    }
  };
}

// ==========================================
// 3. MAIN COMPONENT RENDERER
// ==========================================
export default async function PublicDynamicPage({ params }: Props) {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  // Jika halaman tidak ditemukan di database, lemparkan ke halaman 404
  if (!pageData) {
    notFound();
  }

  return (
    <main className="w-full min-h-screen bg-white">
      <PublicRenderer pageData={pageData} />
    </main>
  );
}