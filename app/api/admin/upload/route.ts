import { NextResponse } from 'next/server';
import { uploadImageToR2 } from '@/lib/r2'; // Mengambil fungsi Cloudflare R2 kita

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    // Di aplikasi Anda, file dikirim sebagai raw Body (stream), bukan FormData
    const arrayBuffer = await request.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'File body is empty or missing' }, { status: 400 });
    }

    // 1. Ubah arrayBuffer menjadi Buffer Node.js agar bisa dibaca S3 SDK
    const buffer = Buffer.from(arrayBuffer);

    // 2. Tentukan Content-Type dasar berdasarkan ekstensi (opsional, karena R2 akan mencoba mendeteksinya)
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filename.endsWith('.png')) contentType = 'image/png';
    else if (filename.endsWith('.webp')) contentType = 'image/webp';
    else if (filename.endsWith('.gif')) contentType = 'image/gif';
    else if (filename.endsWith('.ttf')) contentType = 'font/ttf';
    else if (filename.endsWith('.otf')) contentType = 'font/otf';

    // 3. Panggil fungsi sakti R2 Anda!
    const publicUrl = await uploadImageToR2(buffer, filename, contentType);

    // 4. Kembalikan URL dengan format yang sama persis seperti Vercel Blob sebelumnya
    // (Agar kode di page.tsx tidak perlu dirubah, yaitu mengharapkan { url: string })
    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error("Error uploading to Cloudflare R2:", error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}