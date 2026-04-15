export type CMSFieldType = 'text' | 'textarea' | 'image' | 'video' | 'select' | 'align' | 'object_array' | 'variant_picker' | 'color' | 'number' | 'font_select';

export type CMSFieldGroup = 'content' | 'layout' | 'spacing' | 'typography' | 'background';

export interface CMSField {
  key: string;
  label: string;
  type: CMSFieldType;
  group?: CMSFieldGroup;
  responsive?: boolean;
  options?: { label: string, value: string }[];
  subFields?: CMSField[];
  limit?: number;
  defaultValue?: any; // FITUR BARU: Nilai Default Bawaan
}

export interface CMSComponentBlueprint {
  name: string;
  description: string;
  fields: CMSField[];
}

export const CMS_COMPONENTS: Record<string, CMSComponentBlueprint> = {
  // ==========================================
  // SMART ATOMS (DYNAMIC / E-COMMERCE)
  // ==========================================
  ATOMIC_PRODUCT_CAROUSEL: {
    name: 'Product Carousel',
    description: 'Slider kartu produk dinamis dengan efek hover.',
    fields: [
      {
        key: 'items',
        label: 'Daftar Produk',
        type: 'object_array',
        group: 'content',
        limit: 12,
        subFields: [
          { key: 'variantId', label: 'Pilih Produk', type: 'variant_picker' },
          { key: 'primaryImage', label: 'Gambar Utama', type: 'image' },
          { key: 'hoverImage', label: 'Gambar Saat Hover', type: 'image' }
        ]
      },
      { key: 'backgroundColor', label: 'Warna Latar (Background)', type: 'color', group: 'background', defaultValue: 'transparent' },
      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px' },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true, defaultValue: '16px' }
    ]
  },

  // ==========================================
  // BASIC ATOMS (LAYOUT & STATIC)
  // ==========================================
  ATOMIC_CONTAINER: {
    name: 'Layout Container',
    description: 'Bungkus elemen lain dengan Flexbox atau Grid (Kolom/Baris).',
    fields: [
      { key: 'display', label: 'Tipe Layout', type: 'select', group: 'layout', responsive: true, defaultValue: 'flex', options: [{ label: 'Block (Tumpuk)', value: 'block' }, { label: 'Flexbox', value: 'flex' }, { label: 'Grid (Kolom)', value: 'grid' }] },
      { key: 'gridColumns', label: 'Kolom Grid (Contoh: 1fr 1fr)', type: 'text', group: 'layout', responsive: true },
      { key: 'flexDirection', label: 'Arah Flexbox', type: 'select', group: 'layout', responsive: true, defaultValue: 'column', options: [{ label: 'Baris (Kiri-Kanan)', value: 'row' }, { label: 'Kolom (Atas-Bawah)', value: 'column' }] },
      { key: 'gap', label: 'Jarak Antar Elemen (px)', type: 'number', group: 'layout', responsive: true, defaultValue: 16 },
      { key: 'alignItems', label: 'Perataan Vertikal', type: 'select', group: 'layout', responsive: true, options: [{ label: 'Atas', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Bawah', value: 'flex-end' }, { label: 'Tarik Penuh', value: 'stretch' }] },
      { key: 'justifyContent', label: 'Perataan Horizontal', type: 'select', group: 'layout', responsive: true, options: [{ label: 'Kiri', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'flex-end' }, { label: 'Spasi Di Antara', value: 'space-between' }] },

      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px' },
      { key: 'marginTop', label: 'Margin Atas', type: 'text', group: 'spacing', responsive: true },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true },

      { key: 'backgroundColor', label: 'Warna Latar', type: 'color', group: 'background', defaultValue: 'transparent' },
      { key: 'borderRadius', label: 'Lengkungan Sudut (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0 },
    ]
  },

  ATOMIC_HEADING: {
    name: 'Heading (Title)',
    description: 'Teks judul utama dengan kontrol tipografi penuh.',
    fields: [
      { key: 'text', label: 'Teks Judul', type: 'text', group: 'content', defaultValue: 'Heading Baru' },
      { key: 'tag', label: 'Tag SEO', type: 'select', group: 'content', defaultValue: 'h2', options: [{ label: 'H1 (Utama)', value: 'h1' }, { label: 'H2 (Sub)', value: 'h2' }, { label: 'H3 (Kecil)', value: 'h3' }, { label: 'H4', value: 'h4' }] },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 36 },
      { key: 'fontWeight', label: 'Ketebalan Font', type: 'select', group: 'typography', defaultValue: '700', options: [{ label: 'Normal (400)', value: '400' }, { label: 'Medium (500)', value: '500' }, { label: 'Bold (700)', value: '700' }, { label: 'Black (900)', value: '900' }] },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#111827' },
      { key: 'letterSpacing', label: 'Spasi Huruf (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 0 },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', responsive: true, options: [{ label: 'Kiri', value: 'left' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'right' }] },

      { key: 'marginTop', label: 'Margin Atas', type: 'text', group: 'spacing', responsive: true },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true, defaultValue: '16px' }
    ]
  },

  ATOMIC_TEXT: {
    name: 'Paragraph / Text',
    description: 'Teks deskripsi panjang dengan pengaturan spasi.',
    fields: [
      { key: 'text', label: 'Konten Paragraf', type: 'textarea', group: 'content', defaultValue: 'Teks paragraf baru.' },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 16 },
      { key: 'lineHeight', label: 'Jarak Baris', type: 'text', group: 'typography', responsive: true, defaultValue: '1.6' },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#4B5563' },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', responsive: true, options: [{ label: 'Kiri', value: 'left' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'right' }, { label: 'Rata Penuh', value: 'justify' }] },

      { key: 'marginTop', label: 'Margin Atas', type: 'text', group: 'spacing', responsive: true },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true, defaultValue: '16px' }
    ]
  },

  ATOMIC_IMAGE: {
    name: 'Image Element',
    description: 'Gambar dengan kontrol dimensi dan radius absolut.',
    fields: [
      { key: 'url', label: 'Pilih Gambar', type: 'image', group: 'content' },

      { key: 'width', label: 'Lebar', type: 'text', group: 'layout', responsive: true, defaultValue: '100%' },
      { key: 'height', label: 'Tinggi', type: 'text', group: 'layout', responsive: true, defaultValue: 'auto' },
      { key: 'objectFit', label: 'Image Fit', type: 'select', group: 'layout', responsive: true, defaultValue: 'cover', options: [{ label: 'Cover (Potong)', value: 'cover' }, { label: 'Contain (Penuh)', value: 'contain' }, { label: 'Fill (Tarik)', value: 'fill' }] },

      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0 },

      { key: 'marginTop', label: 'Margin Atas', type: 'text', group: 'spacing', responsive: true },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true, defaultValue: '16px' }
    ]
  },

  ATOMIC_BUTTON: {
    name: 'Button (CTA)',
    description: 'Tombol interaktif kustom.',
    fields: [
      { key: 'label', label: 'Label Tombol', type: 'text', group: 'content', defaultValue: 'KLIK DI SINI' },
      { key: 'url', label: 'Tautan (Link URL)', type: 'text', group: 'content', defaultValue: '#' },

      { key: 'align', label: 'Posisi Tombol', type: 'align', group: 'layout', responsive: true, defaultValue: 'flex-start', options: [{ label: 'Kiri', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'flex-end' }] },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit' },
      { key: 'textColor', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#ffffff' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 14 },

      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing', responsive: true, defaultValue: '12px 24px' },
      { key: 'marginTop', label: 'Margin Atas', type: 'text', group: 'spacing', responsive: true },
      { key: 'marginBottom', label: 'Margin Bawah', type: 'text', group: 'spacing', responsive: true, defaultValue: '16px' },

      { key: 'backgroundColor', label: 'Warna Background', type: 'color', group: 'background', defaultValue: '#000000' },
      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0 },
      { key: 'borderWidth', label: 'Tebal Garis (px)', type: 'number', group: 'background', defaultValue: 0 },
      { key: 'borderColor', label: 'Warna Garis', type: 'color', group: 'background', defaultValue: 'transparent' },
    ]
  },

  ATOMIC_SPACER: {
    name: 'Spacer Element',
    description: 'Pemisah antar elemen bebas pixel.',
    fields: [
      { key: 'height', label: 'Tinggi Spasi (px)', type: 'number', group: 'spacing', responsive: true, defaultValue: 40 }
    ]
  }
};