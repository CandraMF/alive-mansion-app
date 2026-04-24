// lib/rajaongkir.ts

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;

// Catatan: Jika Anda menggunakan akun Starter, URL-nya adalah 'starter'. 
// Jika Anda upgrade ke Basic/Pro, ganti kata 'starter' di bawah ini menjadi 'basic' atau 'pro'.
const BASE_URL = 'https://api.rajaongkir.com/starter';

// Helper untuk fetch agar lebih rapi
async function fetchRajaOngkir(endpoint: string, options: RequestInit = {}) {
  if (!RAJAONGKIR_API_KEY) throw new Error("RAJAONGKIR_API_KEY is not set in .env");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'key': RAJAONGKIR_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (data.rajaongkir.status.code !== 200) {
    throw new Error(data.rajaongkir.status.description);
  }
  return data.rajaongkir;
}

// 1. AMBIL DAFTAR PROVINSI
export async function getProvinces() {
  try {
    const data = await fetchRajaOngkir('/province');
    return data.results;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
}

// 2. AMBIL DAFTAR KOTA BERDASARKAN ID PROVINSI
export async function getCities(provinceId: string) {
  try {
    const data = await fetchRajaOngkir(`/city?province=${provinceId}`);
    return data.results;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

// 3. HITUNG ONGKOS KIRIM
export async function calculateShippingCost(
  originCityId: string, 
  destinationCityId: string, 
  weightInGrams: number, 
  courier: 'jne' | 'pos' | 'tiki'
) {
  try {
    const body = new URLSearchParams({
      origin: originCityId,
      destination: destinationCityId,
      weight: weightInGrams.toString(),
      courier: courier,
    });

    const data = await fetchRajaOngkir('/cost', {
      method: 'POST',
      body: body.toString(),
    });

    return data.results[0]; // Mengembalikan array layanan dari kurir tersebut (misal: JNE OKE, JNE REG, dll)
  } catch (error) {
    console.error("Error calculating cost:", error);
    return null;
  }
}