import AboutPageClient from '@/components/AboutPageClient';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <section className="relative h-[calc(100dvh-68px)] w-full flex items-center justify-center overflow-hidden">

      {/* 2. KONTEN DI TENGAH (Logo & Deskripsi) */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 max-w-3xl flex flex-col items-center gap-10">


        <div className="flex flex-col gap-6 items-center text-black">
          <h2 className='font bold'>Contact Us</h2>

        </div>
        <div className="max-w-5xl text-left text-black">
          <p className="text-xs md:text-sm font-bold text-black">Office</p>
          <p className="text-xs md:text-sm font-light text-black">
            Conclave Wijaya, Jl. Wijaya I No.5C 7, RT.7/RW.4, Petogogan, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12170
          </p>
          <p className="text-xs md:text-sm font-bold text-black mt-6">Workshop</p>
          <p className="text-xs md:text-sm font-light text-black">
            Jl. Melati Blok M No.21, RT.6/RW.12, Duri Kosambi, Kecamatan Cengkareng, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11750
          </p>
          <p className="text-xs md:text-sm font-bold text-black mt-6">Instagram</p>
          <p className="text-xs md:text-sm font-light text-black">
            @alive.mansion
          </p>
        </div>
      </div>
    </section>
  );
}