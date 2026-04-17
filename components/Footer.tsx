import Link from 'next/link';

export default function Footer({ data }: { data?: any }) {
  // 1. Siapkan fallback data jika database kosong
  const copyrightText = data?.copyright || `Copyright © ${new Date().getFullYear()} ALIVE MANSION`;

  const columns = data?.columns || [
    {
      title: "Client Care",
      links: [
        { label: "Contact Us", url: "/contact" },
        { label: "FAQs", url: "/faq" },
        { label: "Shipping", url: "/shipping" }
      ]
    },
    {
      title: "Legal Information",
      links: [
        { label: "Terms & Conditions", url: "/terms" },
        { label: "Privacy Policy", url: "/privacy" }
      ]
    }
  ];

  return (
    <footer className="px-6 md:px-10 py-16 border-t border-border bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Top Section: Dinamis Berdasarkan Kolom Database */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          {/* Render Kolom Dinamis */}
          {columns.map((col: any, idx: number) => (
            <div key={idx}>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-6 text-black">
                {col.title}
              </p>
              <ul className="space-y-3">
                {(col.links || []).map((link: any, linkIdx: number) => (
                  <li key={linkIdx}>
                    <Link href={link.url} className="text-xs text-muted-foreground hover:text-black transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column Terakhir: Language & Follow Us (Tetap Hardcode Ikon Sosial Media untuk saat ini, kecuali Anda ingin mengubah ikonnya dari CMS) */}
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4 text-black">Language</p>
              <button className="text-xs text-muted-foreground border border-border px-6 py-2.5 hover:border-black hover:text-black transition-all">
                English
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4 text-black">Follow Us</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  IG
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  X
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright Dinamis */}
        <div className="flex font-semibold flex-col items-center justify-center border-t border-border pt-12 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            {copyrightText}
          </p>
        </div>

      </div>
    </footer>
  );
}