"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </LanguageProvider>
    </SessionProvider>
  );
}
