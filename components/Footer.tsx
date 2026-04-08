import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="px-6 md:px-10 py-16 border-border bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Top Section: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          {/* Column 1: Client Care */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-6 text-black">Client Care</p>
            <ul className="space-y-0">
              {["Contact Us", "FAQs", "Packaging", "Repair Icon", "Shipping", "Boutiques"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-black transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Legal Information */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-6 text-black">Legal Information</p>
            <ul className="space-y-0">
              {["Terms", "Privacy", "Cookies", "Accessibility Statement"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-black transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Language & Follow Us */}
          <div className="flex flex-col gap-10">
            {/* Language */}
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4 text-black">Language</p>
              <button className="text-xs text-muted-foreground border border-border px-6 py-2.5 hover:border-black hover:text-black transition-all">
                English
              </button>
            </div>

            {/* Follow Us */}
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4 text-black">Follow Us</p>
              <div className="flex gap-3">
                {/* IG Icon */}
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>

                {/* X Icon */}
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                  </svg>
                </a>

                {/* FB Icon */}
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>

                {/* TW / YT Icon */}
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-black hover:text-black transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex font-semibold flex-col items-center justify-center border-border pt-12 text-center">
          <Link href="#" className="text-sm hover:text-black transition-colors">
            Maison Margiela is part of OTB
          </Link>
          <Link href="#" className="text-sm hover:text-black transition-colors">
            Maison Margiela supports the OTB Foundation
          </Link>
          <Link href="#" className="text-sm hover:text-black transition-colors mb-4">
            Careers
          </Link>

          <p className="text-sm">
            Copyright © 2026 - v5.8.24
          </p>
        </div>

      </div>
    </footer>
  );
}