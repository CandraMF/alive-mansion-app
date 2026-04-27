import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 1. Inisialisasi Koneksi ke Cloudflare R2
const s3Client = new S3Client({
  region: "auto", // 🚀 R2 wajib menggunakan region "auto"
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Fungsi untuk meng-upload file Buffer ke Cloudflare R2
 */
export async function uploadImageToR2(fileBuffer: Buffer, fileName: string, contentType: string) {
  try {
    // 2. Buat nama file unik agar tidak saling menimpa (tambahkan timestamp)
    const cleanFileName = fileName.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    // 3. Siapkan kargo (Command) yang akan dikirim ke Bucket
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    // 4. Terbangkan ke Cloudflare R2
    await s3Client.send(command);

    // 5. Kembalikan URL Publik-nya agar bisa disimpan ke Database Prisma
    // Perhatian: Pastikan NEXT_PUBLIC_R2_PUBLIC_URL di .env tidak berakhiran "/"
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error("Gagal upload ke R2:", error);
    throw new Error("Failed to upload image to Cloudflare R2");
  }
}