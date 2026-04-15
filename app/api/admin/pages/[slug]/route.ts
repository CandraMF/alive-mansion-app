import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let page = await prisma.page.findUnique({
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

    if (!page) {
      page = await prisma.page.create({
        data: {
          title: slug === 'home' ? 'Homepage' : `Halaman ${slug}`,
          slug: slug,
          isPublished: false,
        },
        include: {
          sections: { include: { blocks: true } }
        }
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Gagal memuat halaman' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // AMBIL SEMUA DATA (TERMASUK SEO & FONTS)
    const { title, isPublished, sections, metaTitle, metaDescription, ogImage, customFonts } = body;

    const updatedPage = await prisma.$transaction(async (tx) => {
      // 1. UPDATE PAGE BESERTA SEO & FONT (Pastikan schema Prisma Anda mendukung field ini)
      const page = await tx.page.update({
        where: { slug },
        data: {
          title,
          isPublished,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          ogImage: ogImage || null,
          customFonts: customFonts || [] // Disimpan sebagai JSON di database
        }
      });

      // 2. BERSIHKAN SEKSI LAMA
      await tx.section.deleteMany({ where: { pageId: page.id } });

      // 3. TULIS ULANG SEKSI & BLOK
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];

          await tx.section.create({
            data: {
              pageId: page.id,
              name: sec.name || `Section ${i + 1}`,
              position: i,

              // 🚀 SIMPAN SEMUA STYLING KE DALAM CONTENT
              content: sec.content || {},

              blocks: {
                create: sec.blocks?.map((block: any, bIdx: number) => ({
                  type: block.type,
                  position: bIdx,
                  content: block.content || {},
                  children: block.children || [],
                  variantId: block.variantId || null
                })) || []
              }
            }
          });
        }
      }

      return page;
    });

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Gagal menyimpan perubahan halaman' }, { status: 500 });
  }
}