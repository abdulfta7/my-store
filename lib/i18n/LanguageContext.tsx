"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations.en) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Persist + apply dir/lang to <html> on change
  const applyLang = useCallback((l: Lang) => {
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    localStorage.setItem("zt-lang", l);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("zt-lang") as Lang | null;
    const initial: Lang = saved === "ar" || saved === "en" ? saved : "en";
    setLangState(initial);
    applyLang(initial);
  }, [applyLang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      applyLang(l);
    },
    [applyLang]
  );

  const t = useCallback(
    (key: keyof typeof translations.en) =>
      (translations[lang][key] as string) ?? translations.en[key],
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
