// lib/rajaongkir.ts

const KOMERCE_API_KEY = process.env.RAJAONGKIR_API_KEY;
// URL Baru Komerce untuk layanan RajaOngkir
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

async function fetchKomerce(endpoint: string, options: RequestInit = {}) {
  if (!KOMERCE_API_KEY) throw new Error("RAJAONGKIR_API_KEY (Komerce) belum di-set di .env");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'key': KOMERCE_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  // Format response Komerce menggunakan pembungkus "meta"
  if (data.meta && data.meta.code !== 200) {
    throw new Error(data.meta.message || "Terjadi kesalahan dari server Komerce");
  }
  
  return data.data;
}

// 1. CARI DESTINASI (Menggantikan sistem Provinsi & Kota)
// Menggunakan parameter 'keyword' seperti "Bandung" atau "Kemayoran"
export async function searchDestination(keyword: string) {
  try {
    const data = await fetchKomerce(`/destination/domestic-destination?search=${keyword}&limit=10`, {
      method: 'GET'
    });
    return data; // Mengembalikan array lokasi lengkap (Provinsi, Kota, Kecamatan)
  } catch (error) {
    console.error("Komerce Search Location Error:", error);
    return [];
  }
}

// 2. HITUNG ONGKOS KIRIM
export async function calculateShippingCost(
  originId: string, 
  destinationId: string, 
  weightInGrams: number, 
  courier: string
) {
  try {
    const body = new URLSearchParams({
      origin: originId,
      destination: destinationId,
      weight: weightInGrams.toString(),
      courier: courier,
    });

    // Endpoint kalkulasi harga Komerce
    const data = await fetchKomerce('/calculate/domestic-cost', {
      method: 'POST',
      body: body.toString(),
    });

    return data; // Mengembalikan array layanan (REG, YES, dll)
  } catch (error) {
    console.error("Komerce Calculate Cost Error:", error);
    return null;
  }
}