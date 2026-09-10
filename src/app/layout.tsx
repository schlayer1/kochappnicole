import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "fit und healthy",
  description: "Smarter SaaS Wochen- und Ernährungsplaner nach Vorgaben der Ernährungstagebuchanalyse (1.508 kcal, 44g Fett, 103g Protein).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "fit und healthy",
  },
};

export const viewport: Viewport = {
  themeColor: "#789A99",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F9F9] text-[#111C1E]">
        {children}
      </body>
    </html>
  );
}
