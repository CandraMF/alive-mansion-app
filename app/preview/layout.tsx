import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // <-- Import Navbar
import Footer from "@/components/Footer"; // <-- Import Footer
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ALIVE MANSION",
  description: "Eksplorasi Ruang dan Bentuk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black antialiased pt-12 flex flex-col min-h-screen`}>
        {/* Tambahkan Navbar global */}
        <Navbar />

        {/* Konten Utama */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Tambahkan Footer global */}
        <Footer />
      </body>
    </html>
  );
}