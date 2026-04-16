export type CMSFieldType = 'text' | 'textarea' | 'image' | 'video' | 'select' | 'align' | 'object_array' | 'variant_picker' | 'color' | 'number' | 'font_select';

export type CMSFieldGroup = 'content' | 'layout' | 'spacing' | 'typography' | 'background';

// 🚀 TIPE DATA BARU UNTUK MESIN CSS OTOMATIS
export interface CMSField {
  key: string;
  label: string;
  type: CMSFieldType;
  group?: CMSFieldGroup;
  responsive?: boolean;
  options?: { label: string, value: string }[];
  subFields?: CMSField[];
  limit?: number;
  defaultValue?: any;

  // 💎 MAGIC ENGINE PROPS
  cssProp?: string;
  cssUnit?: string;
  cssTarget?: 'atom' | 'wrapper' | 'img';
}

export interface CMSComponentBlueprint {
  name: string;
  description: string;
  fields: CMSField[];
}

export const CMS_COMPONENTS: Record<string, CMSComponentBlueprint> = {
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
      { key: 'backgroundColor', label: 'Warna Latar', type: 'color', group: 'background', defaultValue: 'transparent', cssProp: 'background-color' },
      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px', cssProp: 'padding' },
      { key: 'margin', label: 'Margin (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px 0px 16px 0px', cssProp: 'margin' }
    ]
  },

  ATOMIC_CONTAINER: {
    name: 'Layout Container',
    description: 'Bungkus elemen, atur max-width, margin, dan posisi.',
    fields: [
      { key: 'display', label: 'Tipe Layout', type: 'select', group: 'layout', responsive: true, defaultValue: 'flex', cssProp: 'display', options: [{ label: 'Block', value: 'block' }, { label: 'Flexbox', value: 'flex' }, { label: 'Grid', value: 'grid' }] },
      { key: 'gridColumns', label: 'Kolom Grid', type: 'text', group: 'layout', responsive: true, cssProp: 'grid-template-columns' },
      { key: 'flexDirection', label: 'Arah Flexbox', type: 'select', group: 'layout', responsive: true, defaultValue: 'column', cssProp: 'flex-direction', options: [{ label: 'Baris', value: 'row' }, { label: 'Kolom', value: 'column' }] },
      { key: 'gap', label: 'Jarak Antar Elemen (px)', type: 'number', group: 'layout', responsive: true, defaultValue: 16, cssProp: 'gap', cssUnit: 'px' },
      { key: 'alignItems', label: 'Perataan Vertikal', type: 'select', group: 'layout', responsive: true, cssProp: 'align-items', options: [{ label: 'Atas', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Bawah', value: 'flex-end' }, { label: 'Tarik Penuh', value: 'stretch' }] },
      { key: 'justifyContent', label: 'Perataan Horizontal', type: 'select', group: 'layout', responsive: true, cssProp: 'justify-content', options: [{ label: 'Kiri', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'flex-end' }, { label: 'Spasi', value: 'space-between' }] },

      { key: 'width', label: 'Lebar (Contoh: 100%, 500px)', type: 'text', group: 'layout', responsive: true, defaultValue: '100%', cssProp: 'width' },
      { key: 'maxWidth', label: 'Max Width', type: 'text', group: 'layout', responsive: true, defaultValue: '1024px', cssProp: 'max-width' },
      { key: 'position', label: 'Positioning', type: 'select', group: 'layout', responsive: true, defaultValue: 'relative', cssProp: 'position', options: [{ label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }] },
      { key: 'top', label: 'Top', type: 'text', group: 'layout', responsive: true, cssProp: 'top' },
      { key: 'bottom', label: 'Bottom', type: 'text', group: 'layout', responsive: true, cssProp: 'bottom' },
      { key: 'left', label: 'Left', type: 'text', group: 'layout', responsive: true, cssProp: 'left' },
      { key: 'right', label: 'Right', type: 'text', group: 'layout', responsive: true, cssProp: 'right' },
      { key: 'transform', label: 'Transform', type: 'text', group: 'layout', responsive: true, cssProp: 'transform' },
      { key: 'zIndex', label: 'Z-Index', type: 'number', group: 'layout', cssProp: 'z-index' },

      { key: 'margin', label: 'Margin (Gunakan 0 auto untuk ke tengah)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px auto', cssProp: 'margin' },
      { key: 'padding', label: 'Padding', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px', cssProp: 'padding' },

      { key: 'backgroundColor', label: 'Warna Latar', type: 'color', group: 'background', defaultValue: 'transparent', cssProp: 'background-color' },
      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0, cssProp: 'border-radius', cssUnit: 'px' },
    ]
  },

  ATOMIC_HEADING: {
    name: 'Heading (Title)',
    description: 'Teks judul utama dengan kontrol tipografi penuh.',
    fields: [
      { key: 'text', label: 'Teks Judul', type: 'text', group: 'content', defaultValue: 'Heading Baru' },
      { key: 'tag', label: 'Tag SEO', type: 'select', group: 'content', defaultValue: 'h2', options: [{ label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' }] },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit', cssProp: 'font-family' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 36, cssProp: 'font-size', cssUnit: 'px' },
      { key: 'fontWeight', label: 'Ketebalan Font', type: 'select', group: 'typography', defaultValue: '700', cssProp: 'font-weight', options: [{ label: 'Normal (400)', value: '400' }, { label: 'Medium (500)', value: '500' }, { label: 'Bold (700)', value: '700' }, { label: 'Black (900)', value: '900' }] },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#111827', cssProp: 'color' },
      { key: 'letterSpacing', label: 'Spasi Huruf (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 0, cssProp: 'letter-spacing', cssUnit: 'px' },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', responsive: true, cssProp: 'text-align', options: [{ label: 'Kiri', value: 'left' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'right' }] },

      { key: 'margin', label: 'Margin (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px 0px 16px 0px', cssProp: 'margin' }
    ]
  },

  ATOMIC_TEXT: {
    name: 'Paragraph / Text',
    description: 'Teks deskripsi panjang dengan pengaturan spasi.',
    fields: [
      { key: 'text', label: 'Konten Paragraf', type: 'textarea', group: 'content', defaultValue: 'Teks paragraf baru.' },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit', cssProp: 'font-family' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 16, cssProp: 'font-size', cssUnit: 'px' },
      { key: 'lineHeight', label: 'Jarak Baris', type: 'text', group: 'typography', responsive: true, defaultValue: '1.6', cssProp: 'line-height' },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#4B5563', cssProp: 'color' },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', responsive: true, cssProp: 'text-align', options: [{ label: 'Kiri', value: 'left' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'right' }, { label: 'Rata Penuh', value: 'justify' }] },

      { key: 'margin', label: 'Margin (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px 0px 16px 0px', cssProp: 'margin' }
    ]
  },

  ATOMIC_IMAGE: {
    name: 'Image Element',
    description: 'Gambar dengan kontrol dimensi dan radius absolut.',
    fields: [
      { key: 'url', label: 'Pilih Gambar', type: 'image', group: 'content' },

      { key: 'width', label: 'Lebar', type: 'text', group: 'layout', responsive: true, defaultValue: '100%', cssProp: 'width' },
      { key: 'height', label: 'Tinggi', type: 'text', group: 'layout', responsive: true, defaultValue: 'auto', cssProp: 'height' },
      { key: 'objectFit', label: 'Image Fit', type: 'select', group: 'layout', responsive: true, defaultValue: 'cover', cssProp: 'object-fit', cssTarget: 'img', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }] },

      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0, cssProp: 'border-radius', cssUnit: 'px' },

      { key: 'margin', label: 'Margin (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px 0px 16px 0px', cssProp: 'margin' }
    ]
  },

  ATOMIC_BUTTON: {
    name: 'Button (CTA)',
    description: 'Tombol interaktif kustom.',
    fields: [
      { key: 'label', label: 'Label Tombol', type: 'text', group: 'content', defaultValue: 'KLIK DI SINI' },
      { key: 'url', label: 'Tautan (Link URL)', type: 'text', group: 'content', defaultValue: '#' },

      { key: 'align', label: 'Posisi Tombol', type: 'align', group: 'layout', responsive: true, defaultValue: 'flex-start', cssProp: 'justify-content', cssTarget: 'wrapper', options: [{ label: 'Kiri', value: 'flex-start' }, { label: 'Tengah', value: 'center' }, { label: 'Kanan', value: 'flex-end' }] },

      { key: 'fontFamily', label: 'Jenis Font', type: 'font_select', group: 'typography', defaultValue: 'inherit', cssProp: 'font-family' },
      { key: 'textColor', label: 'Warna Teks', type: 'color', group: 'typography', defaultValue: '#ffffff', cssProp: 'color' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography', responsive: true, defaultValue: 14, cssProp: 'font-size', cssUnit: 'px' },

      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing', responsive: true, defaultValue: '12px 24px', cssProp: 'padding' },
      { key: 'margin', label: 'Margin (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '0px 0px 16px 0px', cssProp: 'margin', cssTarget: 'wrapper' },

      { key: 'backgroundColor', label: 'Warna Background', type: 'color', group: 'background', defaultValue: '#000000', cssProp: 'background-color' },
      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background', responsive: true, defaultValue: 0, cssProp: 'border-radius', cssUnit: 'px' },
      { key: 'borderWidth', label: 'Tebal Garis (px)', type: 'number', group: 'background', defaultValue: 0, cssProp: 'border-width', cssUnit: 'px' },
      { key: 'borderColor', label: 'Warna Garis', type: 'color', group: 'background', defaultValue: 'transparent', cssProp: 'border-color' },
    ]
  },

  ATOMIC_SPACER: {
    name: 'Spacer Element',
    description: 'Pemisah antar elemen bebas pixel.',
    fields: [
      { key: 'height', label: 'Tinggi Spasi (px)', type: 'number', group: 'spacing', responsive: true, defaultValue: 40, cssProp: 'height', cssUnit: 'px' }
    ]
  }
};