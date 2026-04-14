// ==========================================
// TIPE DATA STRUKTUR CMS
// ==========================================
export type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'video'
  | 'select'
  | 'variant_picker'
  | 'object_array';

export type CMSField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[]; // Khusus tipe 'select'
  limit?: number; // Khusus tipe 'object_array' (batas maksimal item)
  subFields?: CMSField[]; // Khusus tipe 'object_array' (field di dalam array)
};

export type CMSComponentBlueprint = {
  name: string;
  description: string;
  fields: CMSField[];
};

// ==========================================
// REGISTRY KOMPONEN (Peta Desain Web Anda)
// ==========================================
export const CMS_COMPONENTS: Record<string, CMSComponentBlueprint> = {

  // 1. KOMPONEN: Hero Video (Cinema.mp4)
  HERO_VIDEO: {
    name: "Hero Video Fullscreen",
    description: "Video latar belakang penuh dengan teks di tengah bawah.",
    fields: [
      { key: "videoUrl", label: "URL Video Latar", type: "video" },
      { key: "overline", label: "Teks Kecil Atas (Cth: Fall Winter 2026)", type: "text" },
      { key: "buttonText", label: "Teks Tombol (Cth: Explore the Collection)", type: "text" },
      { key: "buttonUrl", label: "Link Tujuan Tombol", type: "text" }
    ]
  },

  // 2. KOMPONEN: Editorial Split (Artisanal, Residences, Collab)
  EDITORIAL_SPLIT: {
    name: "Editorial Split (Gambar & Teks)",
    description: "Seksi dengan gambar di satu sisi dan paragraf cerita di sisi lainnya.",
    fields: [
      {
        key: "imagePosition",
        label: "Posisi Gambar",
        type: "select",
        options: [
          { label: "Kiri", value: "left" },
          { label: "Kanan", value: "right" },
          { label: "Tengah (Center Align)", value: "center" }
        ]
      },
      { key: "imageUrl", label: "Gambar Utama", type: "image" },
      { key: "overline", label: "Label Kecil Atas", type: "text" },
      { key: "title", label: "Judul Utama (Italic)", type: "textarea" },
      { key: "description", label: "Deskripsi Teks Paragraf", type: "textarea" },
      { key: "buttonText", label: "Teks Tombol (Bawah Bergaris)", type: "text" },
      { key: "buttonUrl", label: "Link Tujuan Tombol", type: "text" }
    ]
  },

  // 3. KOMPONEN: Hero 2 Gambar Terbelah (Women & Men SS26)
  HERO_SPLIT_IMAGE: {
    name: "Hero 2 Gambar Terbelah",
    description: "Dua gambar berdampingan penuh dengan 2 tombol navigasi.",
    fields: [
      { key: "imageLeft", label: "Gambar Sisi Kiri", type: "image" },
      { key: "imageRight", label: "Gambar Sisi Kanan", type: "image" },
      { key: "overline", label: "Teks Kecil Atas", type: "text" },
      { key: "title", label: "Judul Tengah (Italic)", type: "text" },
      { key: "link1Text", label: "Teks Link 1 (Kiri)", type: "text" },
      { key: "link1Url", label: "URL Link 1", type: "text" },
      { key: "link2Text", label: "Teks Link 2 (Kanan)", type: "text" },
      { key: "link2Url", label: "URL Link 2", type: "text" }
    ]
  },

  // 4. KOMPONEN: Product Carousel (Korsel Slider 5 Produk)
  PRODUCT_CAROUSEL: {
    name: "Korsel Produk (Horizontal Scroll)",
    description: "Slider horizontal yang menampilkan produk dengan efek hover ganti gambar.",
    fields: [
      {
        key: "items",
        label: "Daftar Produk (Maks 10)",
        type: "object_array",
        limit: 10,
        subFields: [
          { key: "variantId", label: "Pilih Produk & Warna Spesifik", type: "variant_picker" },
          { key: "primaryImage", label: "Gambar Default (Saat diam)", type: "image" },
          { key: "hoverImage", label: "Gambar Hover (Saat disentuh kursor)", type: "image" }
        ]
      }
    ]
  },

  // 5. KOMPONEN: Newsletter
  NEWSLETTER: {
    name: "Form Newsletter",
    description: "Seksi langganan email beserta deskripsi singkat brand.",
    fields: [
      { key: "description", label: "Deskripsi Brand (Teks kecil)", type: "textarea" },
      { key: "title", label: "Judul Ajakan", type: "text" },
      { key: "subtitle", label: "Sub Judul Ajakan", type: "text" },
      { key: "placeholder", label: "Teks Placeholder Kotak Email", type: "text" }
    ]
  }
};