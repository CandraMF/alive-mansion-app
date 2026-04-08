import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alive Mansion',
  description: 'Modern E-Commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}