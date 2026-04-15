import { Mail, LayoutPanelLeft, SplitSquareHorizontal, Megaphone } from 'lucide-react';

export const CMS_TEMPLATES: Record<string, any> = {
  HERO_SPLIT: {
    name: "Hero Split Text & Image",
    description: "Layout 2 kolom dengan teks di kiri dan gambar di kanan.",
    icon: LayoutPanelLeft,
    block: {
      type: "ATOMIC_CONTAINER",
      content: { display: "grid", gridColumns: "1fr 1fr", gap: 40, alignItems: "center", padding: "80px 20px" },
      children: [
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", flexDirection: "column" },
          children: [
            { type: "ATOMIC_HEADING", content: { text: "Discover The New Collection", tag: "h1", fontSize: 48, fontWeight: "900", marginBottom: 16 } },
            { type: "ATOMIC_TEXT", content: { text: "Explore our latest arrivals designed for the modern lifestyle. Crafted with premium materials.", fontSize: 18, color: "#4B5563", marginBottom: 32 } },
            { type: "ATOMIC_BUTTON", content: { label: "SHOP NOW", backgroundColor: "#000000", textColor: "#ffffff", padding: "16px 32px" } }
          ]
        },
        {
          type: "ATOMIC_IMAGE",
          content: { width: "100%", height: "auto", borderRadius: 16, objectFit: "cover" }
        }
      ]
    }
  },
  EDITORIAL_RIGHT: {
    name: "Editorial Image Left",
    description: "Layout editorial dengan gambar di kiri dan cerita di kanan.",
    icon: SplitSquareHorizontal,
    block: {
      type: "ATOMIC_CONTAINER",
      content: { display: "grid", gridColumns: "1fr 1fr", gap: 60, alignItems: "center", padding: "80px 20px" },
      children: [
        {
          type: "ATOMIC_IMAGE",
          content: { width: "100%", height: "auto", borderRadius: 0, objectFit: "cover" }
        },
        {
          type: "ATOMIC_CONTAINER",
          content: { display: "flex", flexDirection: "column" },
          children: [
            { type: "ATOMIC_TEXT", content: { text: "OUR STORY", fontSize: 12, letterSpacing: 2, color: "#9CA3AF", marginBottom: 8 } },
            { type: "ATOMIC_HEADING", content: { text: "Crafting Elegance", tag: "h2", fontSize: 36, fontWeight: "700", marginBottom: 16 } },
            { type: "ATOMIC_TEXT", content: { text: "Every piece is a testament to our dedication to quality and timeless design. We believe in creating garments that last.", fontSize: 16, lineHeight: "1.8", color: "#6B7280", marginBottom: 32 } },
            { type: "ATOMIC_BUTTON", content: { label: "READ MORE", backgroundColor: "transparent", textColor: "#000000", borderWidth: 1, borderColor: "#000000", padding: "12px 24px" } }
          ]
        }
      ]
    }
  },
  NEWSLETTER_BASIC: {
    name: "Newsletter Simple",
    description: "Form berlangganan estetik dengan teks di tengah.",
    icon: Mail,
    block: {
      type: "ATOMIC_CONTAINER",
      content: { display: "flex", flexDirection: "column", padding: "80px 20px", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", borderRadius: 16 },
      children: [
        { type: "ATOMIC_HEADING", content: { text: "Receive the Newsletter", fontSize: 28, align: "center", marginBottom: 8 } },
        { type: "ATOMIC_TEXT", content: { text: "Stay up to date with the latest collections and exclusive offers.", align: "center", color: "#6b7280", marginBottom: 32 } },
        { type: "ATOMIC_BUTTON", content: { label: "SUBSCRIBE NOW", align: "center", backgroundColor: "#000000", textColor: "#ffffff", borderRadius: 4, padding: "16px 32px" } }
      ]
    }
  },
  FULL_HERO_CTA: {
    name: "Full Hero Call-to-Action",
    description: "Teks besar di tengah untuk menarik perhatian maksimal.",
    icon: Megaphone,
    block: {
      type: "ATOMIC_CONTAINER",
      content: { display: "flex", flexDirection: "column", padding: "120px 20px", alignItems: "center", justifyContent: "center" },
      children: [
        { type: "ATOMIC_HEADING", content: { text: "Ready to elevate your style?", tag: "h2", fontSize: 56, fontWeight: "900", align: "center", marginBottom: 24 } },
        { type: "ATOMIC_BUTTON", content: { label: "EXPLORE COLLECTION", backgroundColor: "#000000", textColor: "#ffffff", padding: "18px 40px", borderRadius: 100 } }
      ]
    }
  }
};