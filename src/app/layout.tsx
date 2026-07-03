import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NZCC Portal",
  description: "New Zealand College of Chiropractic — Applicant Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
