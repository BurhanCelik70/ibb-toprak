import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toprak Rehberi | İBB Çevre Koruma ve Kontrol Dairesi Başkanlığı",
  description:
    "İstanbul Büyükşehir Belediyesi Çevre Koruma ve Kontrol Dairesi Başkanlığı Toprak Rehberi: toprak analiz raporunuzu yükleyin, kalite indeksini ve bitkinize özel gübreleme programını görün.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}