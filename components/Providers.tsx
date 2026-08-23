"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { LanguageProvider, useLang } from "@/lib/i18n/LanguageContext";

function DynamicToaster() {
  const { isRTL } = useLang();
  return <Toaster position={isRTL ? "bottom-left" : "bottom-right"} richColors />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <DynamicToaster />
      </LanguageProvider>
    </SessionProvider>
  );
}
