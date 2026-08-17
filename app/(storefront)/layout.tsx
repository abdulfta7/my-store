import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackToTop } from "@/components/BackToTop";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header categories={categories} brands={brands} />
      <main style={{ minHeight: "calc(100vh - 400px)" }}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}
