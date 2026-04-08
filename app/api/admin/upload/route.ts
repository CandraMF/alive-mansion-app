import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const file = request.body;

    if (!file) {
      return NextResponse.json({ error: 'File body is required' }, { status: 400 });
    }

    // Vercel akan otomatis menambahkan string acak agar nama file selalu unik
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Error uploading to Blob:", error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}