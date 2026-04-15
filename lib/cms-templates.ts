import {
  Video, LayoutPanelLeft, SplitSquareHorizontal,
  GalleryHorizontalEnd, Megaphone, Mail, Columns
} from 'lucide-react';

export const CMS_TEMPLATES: Record<string, any> = {
  // ==========================================
  // 1. HERO VIDEO (ABSOLUTE TEXT DI BAWAH)
  // ==========================================
  HERO_VIDEO_ABSOLUTE: {
    name: "Fullscreen Hero Video",
    description: "Template untuk video fullscreen dengan teks melayang di bawah tengah (seperti Fall Winter 2026).",
    icon: Video,
    // Catatan: Setelah insert, admin perlu set Section -> Tinggi: 100vh & Background Video di Inspector Section
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        position: "absolute",
        bottom: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
      },
      children: [
        {
          type: "ATOMIC_TEXT",
          content: { text: "Fall Winter 2026", color: "#ffffff", fontSize: 12, letterSpacing: 3, align: "center", marginBottom: 8 }
        },
        {
          type: "ATOMIC_BUTTON",
          content: { label: "Explore the Collection", url: "#", textColor: "#ffffff", backgroundColor: "transparent", padding: "0px 0px 4px 0px", borderWidth: 0, borderColor: "transparent", fontSize: 12 }
        }
      ]
    }
  },

  // ==========================================
  // 2. EDITORIAL: IMAGE LEFT, TEXT RIGHT
  // ==========================================
  EDITORIAL_IMAGE_LEFT: {
    name: "Editorial (Image Left)",
    description: "Grid 2 kolom elegan. Gambar di kiri, cerita di kanan (seperti Alive Mansion/Artisanal).",
    icon: LayoutPanelLeft,
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "flex",
        displayDesktop: "grid",
        gridColumnsDesktop: "1fr 1fr",
        gap: 48,
        gapDesktop: 80,
        maxWidth: "1024px",
        margin: "0px auto",
        alignItems: "center"
      },
      children: [
        {
          type: "ATOMIC_IMAGE",
          content: { width: "100%", height: "auto", objectFit: "cover" }
        },
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "Alive Mansion/Artisanal", fontSize: 12, letterSpacing: 2, color: "#9CA3AF", marginBottom: 24 } },
            { type: "ATOMIC_TEXT", content: { text: "Conceived by our hope to explore the ideas and values that shape us.", fontSize: 18, lineHeight: "1.8", color: "#111827", marginBottom: 16 } },
            { type: "ATOMIC_TEXT", content: { text: "Through a study of our archival DNA, we selected five house codes that will be explored across exhibitions and experiences in cities this April.", fontSize: 16, lineHeight: "1.8", color: "#6B7280", marginBottom: 32 } },
            { type: "ATOMIC_BUTTON", content: { label: "Discover More", url: "#", backgroundColor: "transparent", textColor: "#000000", padding: "0px 0px 4px 0px", fontSize: 10, letterSpacing: 2 } }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 3. EDITORIAL: TEXT LEFT, IMAGE RIGHT
  // ==========================================
  EDITORIAL_TEXT_LEFT: {
    name: "Editorial (Text Left)",
    description: "Grid 2 kolom elegan. Teks di kiri, gambar di kanan (seperti Alive Mansion x Gentle Monster).",
    icon: SplitSquareHorizontal,
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "flex",
        displayDesktop: "grid",
        gridColumnsDesktop: "1fr 1fr",
        gap: 48,
        gapDesktop: 80,
        maxWidth: "1024px",
        margin: "0px auto",
        alignItems: "center"
      },
      children: [
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "FEATURED", fontSize: 12, letterSpacing: 2, color: "#9CA3AF", marginBottom: 16 } },
            { type: "ATOMIC_HEADING", content: { text: "Alive Mansion × Gentle Monster", tag: "h2", fontSize: 24, fontWeight: "400", marginBottom: 16 } },
            { type: "ATOMIC_BUTTON", content: { label: "Discover the Collection", url: "#", backgroundColor: "transparent", textColor: "#000000", padding: "0px 0px 4px 0px", fontSize: 10, letterSpacing: 2 } }
          ]
        },
        {
          type: "ATOMIC_IMAGE",
          content: { width: "100%", height: "auto", objectFit: "cover" }
        }
      ]
    }
  },

  // ==========================================
  // 4. SPLIT HERO IMAGES (50/50 FULLSCREEN)
  // ==========================================
  HERO_SPLIT_IMAGES: {
    name: "Hero Split 50/50 Images",
    description: "2 Gambar bersandingan penuh layar dengan overlay gelap dan teks absolut di tengah.",
    icon: Columns,
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        position: "relative",
        display: "flex",
        displayDesktop: "grid",
        gridColumnsDesktop: "1fr 1fr",
        width: "100%",
        minHeight: "120vh",
        gap: 0,
        padding: "0px",
        margin: "0px"
      },
      children: [
        // Gambar Kiri
        { type: "ATOMIC_IMAGE", content: { width: "100%", height: "100%", objectFit: "cover", marginBottom: 0 } },
        // Gambar Kanan
        { type: "ATOMIC_IMAGE", content: { width: "100%", height: "100%", objectFit: "cover", marginBottom: 0 } },

        // Dark Overlay Absolute
        {
          type: "ATOMIC_CONTAINER",
          content: { position: "absolute", top: "0px", left: "0px", bottom: "0px", right: "0px", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5 }
        },

        // Text Content Absolute
        {
          type: "ATOMIC_CONTAINER",
          content: {
            position: "absolute",
            bottom: "64px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "New Arrivals in Society", color: "#ffffff", fontSize: 10, letterSpacing: 3, align: "center", marginBottom: 4 } },
            { type: "ATOMIC_HEADING", content: { text: "Spring Summer 2026", tag: "h2", color: "#ffffff", fontSize: 24, fontWeight: "400", align: "center", marginBottom: 16 } },
            {
              type: "ATOMIC_CONTAINER",
              content: { display: "flex", flexDirection: "row", gap: 16, justifyContent: "center" },
              children: [
                { type: "ATOMIC_BUTTON", content: { label: "WOMEN", url: "#", textColor: "#ffffff", backgroundColor: "transparent", fontSize: 12, letterSpacing: 1.5, padding: "0px" } },
                { type: "ATOMIC_BUTTON", content: { label: "MEN", url: "#", textColor: "#ffffff", backgroundColor: "transparent", fontSize: 12, letterSpacing: 1.5, padding: "0px" } }
              ]
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 5. PRODUCT CAROUSEL
  // ==========================================
  PRODUCT_CAROUSEL_SECTION: {
    name: "Snap Product Carousel",
    description: "Slider kartu produk horizontal bergaya e-commerce.",
    icon: GalleryHorizontalEnd,
    block: {
      type: "ATOMIC_PRODUCT_CAROUSEL",
      content: { backgroundColor: "transparent", padding: "0px", marginBottom: "0px" }
    }
  },

  // ==========================================
  // 6. NEWSLETTER TEXT BLOCK
  // ==========================================
  NEWSLETTER_BASIC: {
    name: "Brand Philosophy & Newsletter",
    description: "Teks deskripsi brand di tengah layar (tanpa form input dinamis, hanya visual).",
    icon: Mail,
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "600px",
        margin: "0px auto",
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        { type: "ATOMIC_TEXT", content: { text: "Alive Mansion is a Parisian haute couture house founded on ideas of anonymity and the elevation of artisan craft. Its collections underscore a focus on materials and construction to define a unique language of its own.", align: "center", color: "#6b7280", fontSize: 12, letterSpacing: 2, lineHeight: "1.8", marginBottom: 24 } },
        { type: "ATOMIC_HEADING", content: { text: "Receive the Newsletter", fontSize: 16, fontWeight: "500", align: "center", marginBottom: 8 } },
        { type: "ATOMIC_TEXT", content: { text: "Stay up to date with the latest collections, events and exclusive content", align: "center", color: "#9ca3af", fontSize: 10, letterSpacing: 2, uppercase: true, marginBottom: 24 } },
        { type: "ATOMIC_BUTTON", content: { label: "SUBSCRIBE (MOCKUP)", align: "center", backgroundColor: "transparent", textColor: "#000000", borderWidth: 1, borderColor: "#000000", padding: "8px 24px", fontSize: 10, letterSpacing: 2 } }
      ]
    }
  }
};