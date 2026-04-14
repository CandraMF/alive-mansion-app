import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Mengambil struktur halaman, seksi, dan blok secara utuh
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
          orderBy: { position: 'asc' }, // Urutkan seksi dari atas ke bawah
          include: {
            blocks: {
              orderBy: { position: 'asc' } // Urutkan elemen di dalam seksi
            }
          }
        }
      }
    });

    // FITUR CERDAS: Jika halaman belum ada (pertama kali dibuka), otomatis buatkan kerangkanya!
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

// 2. PUT: Menyimpan seluruh perubahan desain (Sapu bersih & Tulis ulang)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, isPublished, sections } = body;

    // Gunakan Prisma Transaction untuk memastikan integritas data CMS
    const updatedPage = await prisma.$transaction(async (tx) => {

      // A. Update nama & status halaman
      const page = await tx.page.update({
        where: { slug },
        data: { title, isPublished }
      });

      // B. HAPUS SEMUA SEKSI LAMA (Ini juga akan otomatis menghapus semua Block karena 'onDelete: Cascade' di schema)
      // Pendekatan "Sapu Bersih" ini sangat aman untuk Drag & Drop UI karena kita tidak perlu melacak ID yang berpindah.
      await tx.section.deleteMany({ where: { pageId: page.id } });

      // C. TULIS ULANG SEMUA SEKSI & BLOK BARU
      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];

          await tx.section.create({
            data: {
              pageId: page.id,
              name: sec.name || `Section ${i + 1}`,
              layout: sec.layout || 'CONTAINER',
              paddingY: sec.paddingY || 'py-12',
              background: sec.background || '',
              position: i, // Simpan urutan drag & drop

              blocks: {
                create: sec.blocks?.map((block: any, bIdx: number) => ({
                  type: block.type,
                  position: bIdx, // Urutan elemen di dalam seksi
                  content: block.content || {}, // Simpan Data JSON!
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