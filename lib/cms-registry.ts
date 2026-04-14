export type CMSFieldType = 'text' | 'textarea' | 'image' | 'video' | 'select' | 'align' | 'object_array' | 'variant_picker' | 'color' | 'number';

// TAMBAHAN: Tipe Group untuk Accordion Inspector
export type CMSFieldGroup = 'content' | 'layout' | 'spacing' | 'typography' | 'background';

export interface CMSField {
  key: string;
  label: string;
  type: CMSFieldType;
  group?: CMSFieldGroup; // <--- Field ini baru
  options?: { label: string, value: string }[];
  subFields?: CMSField[];
  limit?: number;
}

export interface CMSComponentBlueprint {
  name: string;
  description: string;
  fields: CMSField[];
}

export const CMS_COMPONENTS: Record<string, CMSComponentBlueprint> = {
  ATOMIC_CONTAINER: {
    name: 'Layout Container',
    description: 'Bungkus elemen lain dengan Flexbox atau Grid (Kolom/Baris).',
    fields: [
      { key: 'display', label: 'Tipe Layout', type: 'select', group: 'layout', options: [{label:'Block (Tumpuk)', value:'block'}, {label:'Flexbox', value:'flex'}, {label:'Grid (Kolom)', value:'grid'}] },
      { key: 'gridColumns', label: 'Kolom Grid (Contoh: 1fr 1fr)', type: 'text', group: 'layout' },
      { key: 'flexDirection', label: 'Arah Flexbox', type: 'select', group: 'layout', options: [{label:'Baris (Kiri-Kanan)', value:'row'}, {label:'Kolom (Atas-Bawah)', value:'column'}] },
      { key: 'gap', label: 'Jarak Antar Elemen (px)', type: 'number', group: 'layout' },
      { key: 'alignItems', label: 'Perataan Vertikal', type: 'select', group: 'layout', options: [{label:'Atas', value:'flex-start'}, {label:'Tengah', value:'center'}, {label:'Bawah', value:'flex-end'}, {label:'Tarik Penuh', value:'stretch'}] },
      { key: 'justifyContent', label: 'Perataan Horizontal', type: 'select', group: 'layout', options: [{label:'Kiri', value:'flex-start'}, {label:'Tengah', value:'center'}, {label:'Kanan', value:'flex-end'}, {label:'Spasi Di Antara', value:'space-between'}] },
      
      { key: 'padding', label: 'Padding Dalam (px)', type: 'text', group: 'spacing' },
      { key: 'marginTop', label: 'Margin Atas (px)', type: 'number', group: 'spacing' },
      { key: 'marginBottom', label: 'Margin Bawah (px)', type: 'number', group: 'spacing' },

      { key: 'backgroundColor', label: 'Warna Latar (Background)', type: 'color', group: 'background' },
      { key: 'borderRadius', label: 'Lengkungan Sudut (px)', type: 'number', group: 'background' },
    ]
  },

  ATOMIC_HEADING: {
    name: 'Heading (Title)',
    description: 'Teks judul utama dengan kontrol tipografi penuh.',
    fields: [
      { key: 'text', label: 'Teks Judul', type: 'text', group: 'content' },
      { key: 'tag', label: 'Tag SEO', type: 'select', group: 'content', options: [{label:'H1 (Utama)', value:'h1'}, {label:'H2 (Sub)', value:'h2'}, {label:'H3 (Kecil)', value:'h3'}, {label:'H4', value:'h4'}] },
      
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography' },
      { key: 'fontWeight', label: 'Ketebalan Font', type: 'select', group: 'typography', options: [{label:'Normal (400)', value:'400'}, {label:'Medium (500)', value:'500'}, {label:'Bold (700)', value:'700'}, {label:'Black (900)', value:'900'}] },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography' },
      { key: 'letterSpacing', label: 'Spasi Huruf (px)', type: 'number', group: 'typography' },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', options: [{label:'Kiri', value:'left'}, {label:'Tengah', value:'center'}, {label:'Kanan', value:'right'}] },
      
      { key: 'marginTop', label: 'Margin Atas (px)', type: 'number', group: 'spacing' },
      { key: 'marginBottom', label: 'Margin Bawah (px)', type: 'number', group: 'spacing' }
    ]
  },
  
  ATOMIC_TEXT: {
    name: 'Paragraph / Text',
    description: 'Teks deskripsi panjang dengan pengaturan spasi.',
    fields: [
      { key: 'text', label: 'Konten Paragraf', type: 'textarea', group: 'content' },
      
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography' },
      { key: 'lineHeight', label: 'Jarak Baris', type: 'text', group: 'typography' },
      { key: 'color', label: 'Warna Teks', type: 'color', group: 'typography' },
      { key: 'align', label: 'Perataan', type: 'align', group: 'typography', options: [{label:'Kiri', value:'left'}, {label:'Tengah', value:'center'}, {label:'Kanan', value:'right'}, {label:'Rata Penuh', value:'justify'}] },
      
      { key: 'marginTop', label: 'Margin Atas (px)', type: 'number', group: 'spacing' },
      { key: 'marginBottom', label: 'Margin Bawah (px)', type: 'number', group: 'spacing' }
    ]
  },

  ATOMIC_IMAGE: {
    name: 'Image Element',
    description: 'Gambar dengan kontrol dimensi dan radius absolut.',
    fields: [
      { key: 'url', label: 'Pilih Gambar', type: 'image', group: 'content' },
      
      { key: 'width', label: 'Lebar (%, px, auto)', type: 'text', group: 'layout' },
      { key: 'height', label: 'Tinggi (px, auto)', type: 'text', group: 'layout' },
      { key: 'objectFit', label: 'Image Fit', type: 'select', group: 'layout', options: [{label:'Cover (Potong)', value:'cover'}, {label:'Contain (Penuh)', value:'contain'}, {label:'Fill (Tarik)', value:'fill'}] },
      
      { key: 'borderRadius', label: 'Lengkungan / Radius (px)', type: 'number', group: 'background' },
      
      { key: 'marginTop', label: 'Margin Atas (px)', type: 'number', group: 'spacing' },
      { key: 'marginBottom', label: 'Margin Bawah (px)', type: 'number', group: 'spacing' }
    ]
  },

  ATOMIC_BUTTON: {
    name: 'Button (CTA)',
    description: 'Tombol interaktif kustom.',
    fields: [
      { key: 'label', label: 'Label Tombol', type: 'text', group: 'content' },
      { key: 'url', label: 'Tautan (Link URL)', type: 'text', group: 'content' },
      
      { key: 'align', label: 'Posisi Tombol', type: 'align', group: 'layout', options: [{label:'Kiri', value:'flex-start'}, {label:'Tengah', value:'center'}, {label:'Kanan', value:'flex-end'}] },
      
      { key: 'textColor', label: 'Warna Teks', type: 'color', group: 'typography' },
      { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number', group: 'typography' },
      
      { key: 'padding', label: 'Padding Dalam', type: 'text', group: 'spacing' },
      { key: 'marginTop', label: 'Margin Atas (px)', type: 'number', group: 'spacing' },
      { key: 'marginBottom', label: 'Margin Bawah (px)', type: 'number', group: 'spacing' },

      { key: 'backgroundColor', label: 'Warna Background', type: 'color', group: 'background' },
      { key: 'borderRadius', label: 'Lengkungan (px)', type: 'number', group: 'background' },
      { key: 'borderWidth', label: 'Tebal Garis (px)', type: 'number', group: 'background' },
      { key: 'borderColor', label: 'Warna Garis', type: 'color', group: 'background' },
    ]
  },

  ATOMIC_SPACER: {
    name: 'Spacer Element',
    description: 'Pemisah antar elemen bebas pixel.',
    fields: [
      { key: 'height', label: 'Tinggi Spasi (px)', type: 'number', group: 'spacing' }
    ]
  }
};