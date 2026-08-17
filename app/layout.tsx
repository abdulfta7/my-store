import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Zoma Tech - متجر التكنولوجيا المصري",
  description:
    "لابتوبات، كمبيوترات، شاشات، أنظمة كاشير، بروجيكتورات ومعدات IT — كل حاجة في مكان واحد.",
  keywords: [
    "electronics", "laptops", "egypt", "tech store",
    "Zoma Tech", "POS systems", "monitors", "لابتوب", "شاشات", "مصر",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang + dir are overridden client-side by LanguageProvider
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
