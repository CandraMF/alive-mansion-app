import {
  Video, LayoutPanelLeft, SplitSquareHorizontal,
  GalleryHorizontalEnd, Megaphone, Mail, Columns, Image as ImageIcon
} from 'lucide-react';

export const CMS_TEMPLATES: Record<string, any> = {
  // ==========================================
  // 1. HERO VIDEO (FALL WINTER 2026)
  // ==========================================
  HERO_VIDEO_ABSOLUTE: {
    name: "Hero Video (Fullscreen)",
    description: "Video layar penuh dengan teks tipografi Fall Winter di bawah tengah.",
    icon: Video,
    sectionContent: {
      padding: "0px",
      minHeight: "calc(100vh + 68px)",
      overflow: "hidden",
      backgroundVideo: "/cinema.mp4"
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        position: "absolute",
        bottom: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        // 🚀 CONTAINER INI YANG MENENGAHKAN TOMBOL
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
      },
      children: [
        {
          type: "ATOMIC_TEXT",
          content: {
            text: "Fall Winter 2026",
            color: "#ffffff",
            fontSize: 12,
            letterSpacing: 4.8,
            align: "center",
            margin: "0px 0px 8px 0px",
            customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }]
          }
        },
        {
          type: "ATOMIC_BUTTON",
          content: {
            label: "Explore the Collection",
            url: "#",
            color: "#ffffff",
            backgroundColor: "transparent",
            padding: "0px 0px 2px 0px",
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 3.2,
            // 🚀 Properti 'align' sudah dihapus dari sini!
            customCss: [
              { prop: "text-transform", val: "uppercase", device: "all" },
              { prop: "border-bottom", val: "1px solid currentColor", device: "all" }
            ],
            states: { hover: { color: "rgba(255, 255, 255, 0.7)" } }
          }
        }
      ]
    }
  },

  // ==========================================
  // 2. EDITORIAL: IMAGE LEFT (ALIVE MANSION / ARTISANAL)
  // ==========================================
  EDITORIAL_IMAGE_LEFT: {
    name: "Editorial (Image Left)",
    description: "Grid 2 kolom elegan. Gambar di kiri, teks serif di kanan.",
    icon: LayoutPanelLeft,
    sectionContent: {
      padding: "128px 40px",
      paddingMobile: "80px 24px",
      backgroundColor: "transparent"
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "grid",
        gridColumns: "1fr 1fr",
        gap: 80,
        maxWidth: "1024px",
        margin: "0px auto",
        alignItems: "center",
        displayMobile: "flex",
        flexDirectionMobile: "column",
        gapMobile: 48
      },
      children: [
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", justifyContent: "center", width: "100%" },
          children: [
            { type: "ATOMIC_IMAGE", content: { url: "/images/post2.jpg", width: "100%", maxWidth: "448px", height: "auto", objectFit: "cover" } }
          ]
        },
        {
          type: "ATOMIC_CONTAINER",
          content: {
            display: "flex", flexDirection: "column", maxWidth: "384px",
            padding: "0px 0px 0px 80px",
            paddingMobile: "0px",
            // 🚀 Desktop di tengah, Mobile rata kiri (Sesuai dengan page.tsx Anda)
            alignItems: "center",
            alignItemsMobile: "flex-start",
            customCss: [{ prop: "text-align", val: "center", device: "desktop" }, { prop: "text-align", val: "left", device: "mobile" }]
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "Alive Mansion/Artisanal", fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#000000", margin: "0px 0px 24px 0px", customCss: [{ prop: "font-style", val: "italic", device: "all" }] } },
            { type: "ATOMIC_TEXT", content: { text: "Conceived by our hope to explore the ideas and values that shape us.", fontFamily: "'Playfair Display', serif", fontSize: 18, fontSizeMobile: 16, lineHeight: "1.8", color: "#374151", margin: "0px 0px 16px 0px" } },
            { type: "ATOMIC_TEXT", content: { text: "Through a study of our archival DNA, we selected five house codes that will be explored across exhibitions and experiences in cities this April.", fontFamily: "'Playfair Display', serif", fontSize: 16, lineHeight: "1.8", color: "#6B7280", margin: "0px 0px 32px 0px" } },
            { type: "ATOMIC_BUTTON", content: { label: "Discover More", url: "#", backgroundColor: "transparent", color: "#000000", padding: "0px 0px 4px 0px", fontSize: 10, fontWeight: "700", letterSpacing: 2, customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }, { prop: "border-bottom", val: "1px solid currentColor", device: "all" }], states: { hover: { color: "#6B7280" } } } }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 3. HERO SPLIT IMAGES (SPRING SUMMER 2026)
  // ==========================================
  HERO_SPLIT_IMAGES: {
    name: "Split Hero (50/50 Images)",
    description: "2 Gambar penuh layar dengan overlay gelap dan teks absolut di tengah.",
    icon: Columns,
    sectionContent: {
      padding: "0px",
      minHeight: "120vh",
      overflow: "hidden"
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        position: "relative", display: "grid", gridColumns: "1fr 1fr", gap: 0, width: "100%", height: "120vh", margin: "0px", displayMobile: "flex", flexDirectionMobile: "column"
      },
      children: [
        { type: "ATOMIC_IMAGE", content: { url: "/images/post4.jpg", width: "100%", height: "100%", objectFit: "cover", margin: "0px" } },
        { type: "ATOMIC_IMAGE", content: { url: "/images/post3.jpg", width: "100%", height: "100%", objectFit: "cover", margin: "0px" } },
        { type: "ATOMIC_CONTAINER", content: { position: "absolute", top: "0px", left: "0px", bottom: "0px", right: "0px", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5 } },
        {
          type: "ATOMIC_CONTAINER",
          content: { 
            position: "absolute", bottom: "64px", left: "50%", transform: "translateX(-50%)", zIndex: 10, 
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" 
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "New Arrivals in Society", color: "#ffffff", fontSize: 10, letterSpacing: 4.8, align: "center", margin: "0px 0px 4px 0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }] } },
            { type: "ATOMIC_HEADING", content: { text: "Spring Summer 2026", tag: "h2", fontFamily: "'Playfair Display', serif", color: "#ffffff", fontSize: 24, fontSizeMobile: 20, align: "center", margin: "0px 0px 16px 0px", customCss: [{ prop: "font-style", val: "italic", device: "all" }] } },
            {
              type: "ATOMIC_CONTAINER", 
              // 🚀 Container khusus pembungkus dua tombol berjajar Horizontal
              content: { display: "flex", flexDirection: "row", gap: 16, justifyContent: "center" },
              children: [
                { type: "ATOMIC_BUTTON", content: { label: "Women", url: "#", color: "#ffffff", backgroundColor: "transparent", fontSize: 12, fontWeight: "700", letterSpacing: 2.4, padding: "0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }], states: { hover: { color: "rgba(255,255,255,0.7)" } } } },
                { type: "ATOMIC_BUTTON", content: { label: "Men", url: "#", color: "#ffffff", backgroundColor: "transparent", fontSize: 12, fontWeight: "700", letterSpacing: 2.4, padding: "0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }], states: { hover: { color: "rgba(255,255,255,0.7)" } } } }
              ]
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 4. HERO SINGLE IMAGE
  // ==========================================
  HERO_SINGLE_IMAGE: {
    name: "Single Hero Image",
    description: "Gambar tunggal layar penuh dengan overlay gelap.",
    icon: ImageIcon,
    sectionContent: {
      padding: "0px",
      minHeight: "120vh",
      overflow: "hidden"
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: { position: "relative", width: "100%", height: "120vh", margin: "0px" },
      children: [
        { type: "ATOMIC_IMAGE", content: { url: "/images/post3.jpg", width: "100%", height: "100%", objectFit: "cover", margin: "0px" } },
        { type: "ATOMIC_CONTAINER", content: { position: "absolute", top: "0px", left: "0px", bottom: "0px", right: "0px", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5 } },
        {
          type: "ATOMIC_CONTAINER",
          content: { 
            position: "absolute", bottom: "64px", left: "50%", transform: "translateX(-50%)", zIndex: 10, 
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" 
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "New Arrivals in Society", color: "#ffffff", fontSize: 10, letterSpacing: 4.8, align: "center", margin: "0px 0px 4px 0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }] } },
            { type: "ATOMIC_HEADING", content: { text: "Spring Summer 2026", tag: "h2", fontFamily: "'Playfair Display', serif", color: "#ffffff", fontSize: 24, align: "center", margin: "0px 0px 16px 0px", customCss: [{ prop: "font-style", val: "italic", device: "all" }] } },
            { type: "ATOMIC_BUTTON", content: { label: "DISCOVER MORE", url: "#", color: "#ffffff", backgroundColor: "transparent", fontSize: 12, fontWeight: "700", letterSpacing: 2.4, padding: "0px", states: { hover: { color: "rgba(255,255,255,0.7)" } } } }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 5. PRODUCT CAROUSEL
  // ==========================================
  PRODUCT_CAROUSEL_SECTION: {
    name: "Product Carousel",
    description: "Slider kartu produk bergaya e-commerce.",
    icon: GalleryHorizontalEnd,
    sectionContent: {
      padding: "64px 0px",
      paddingMobile: "64px 0px",
      backgroundColor: "#f9fafb"
    },
    block: {
      type: "ATOMIC_PRODUCT_CAROUSEL",
      content: { backgroundColor: "transparent", padding: "0px", margin: "0px" }
    }
  },

  // ==========================================
  // 6. EDITORIAL: TEXT LEFT (ALIVE MANSION X GENTLE MONSTER)
  // ==========================================
  EDITORIAL_TEXT_LEFT: {
    name: "Editorial (Text Left)",
    description: "Teks di kiri, gambar di kanan. Sempurna untuk kolaborasi.",
    icon: SplitSquareHorizontal,
    sectionContent: {
      padding: "112px 40px",
      paddingMobile: "80px 24px"
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "grid", gridColumns: "1fr 1fr", gap: 48, maxWidth: "1024px", margin: "0px auto", alignItems: "center", displayMobile: "flex", flexDirectionMobile: "column-reverse"
      },
      children: [
        {
          type: "ATOMIC_CONTAINER",
          content: {
            display: "flex", flexDirection: "column", padding: "0px",
            // 🚀 Penengah Desktop & Mobile Left
            alignItems: "center",
            alignItemsMobile: "flex-start",
            customCss: [{ prop: "text-align", val: "center", device: "desktop" }, { prop: "text-align", val: "left", device: "mobile" }]
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "FEATURED", fontSize: 12, fontWeight: "700", letterSpacing: 3, color: "#9CA3AF", margin: "0px 0px 16px 0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }] } },
            { type: "ATOMIC_HEADING", content: { text: "Alive Mansion × Gentle Monster", tag: "h2", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: "400", margin: "0px 0px 16px 0px", customCss: [{ prop: "font-style", val: "italic", device: "all" }] } },
            { type: "ATOMIC_BUTTON", content: { label: "Discover the Collection", url: "#", backgroundColor: "transparent", color: "#000000", padding: "0px 0px 4px 0px", fontSize: 10, fontWeight: "700", letterSpacing: 2, customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }, { prop: "border-bottom", val: "1px solid currentColor", device: "all" }], states: { hover: { color: "#6B7280" } } } }
          ]
        },
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", justifyContent: "center", width: "100%" },
          children: [
            { type: "ATOMIC_IMAGE", content: { url: "/images/collab.jpg", width: "100%", maxWidth: "448px", height: "auto", objectFit: "cover", customCss: [{ prop: "margin-left", val: "auto", device: "desktop" }] } }
          ]
        }
      ]
    }
  },

  // ==========================================
  // 7. NEWSLETTER TEXT BLOCK (EMAIL MOCKUP)
  // ==========================================
  NEWSLETTER_BASIC: {
    name: "Newsletter Block",
    description: "Teks deskripsi brand dengan form mockup email.",
    icon: Mail,
    sectionContent: {
      padding: "64px 40px",
      paddingMobile: "64px 24px",
      customCss: [{ prop: "border-top", val: "1px solid #e5e7eb", device: "all" }]
    },
    block: {
      type: "ATOMIC_CONTAINER",
      content: {
        display: "flex", flexDirection: "column", maxWidth: "576px", margin: "0px auto", 
        // 🚀 Mengatur semuanya agar berada di tengah
        alignItems: "center", justifyContent: "center"
      },
      children: [
        { type: "ATOMIC_TEXT", content: { text: "Alive Mansion is a Parisian haute couture house founded on ideas of anonymity and the elevation of artisan craft. Its collections underscore a focus on materials and construction to define a unique language of its own.", align: "center", fontFamily: "'Playfair Display', serif", color: "#6B7280", fontSize: 12, letterSpacing: 2, lineHeight: "1.8", margin: "0px 0px 24px 0px" } },
        { type: "ATOMIC_HEADING", content: { text: "Receive the Newsletter", fontSize: 16, fontWeight: "500", letterSpacing: 1, align: "center", margin: "0px 0px 8px 0px" } },
        { type: "ATOMIC_TEXT", content: { text: "Stay up to date with the latest collections, events and exclusive content", align: "center", color: "#9CA3AF", fontSize: 10, letterSpacing: 3, margin: "0px 0px 24px 0px", customCss: [{ prop: "text-transform", val: "uppercase", device: "all" }] } },

        {
          type: "ATOMIC_CONTAINER",
          content: {
            display: "flex", flexDirection: "row", width: "100%", maxWidth: "384px", margin: "0px auto", padding: "12px 0px", alignItems: "center", justifyContent: "space-between",
            customCss: [{ prop: "border-bottom", val: "1px solid #000000", device: "all" }]
          },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "Email address", color: "#9CA3AF", fontSize: 12, letterSpacing: 2 } },
            { type: "ATOMIC_TEXT", content: { text: "→", color: "#000000", fontSize: 16, fontWeight: "700", customCss: [{ prop: "cursor", val: "pointer", device: "all" }] } }
          ]
        }
      ]
    }
  }
};