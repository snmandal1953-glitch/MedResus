import React, { createContext, useContext, useMemo, useState } from "react";
import { STRINGS } from "./strings";

type Lang = keyof typeof STRINGS;

type I18nContextType = {
  lang: Lang;
  t: (key: keyof typeof STRINGS["en"], params?: any) => any;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  t: (k) => k,
  toggleLang: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  const t = useMemo(() => {
    return (key: any, params?: any) => {
      const value = STRINGS[lang][key as keyof typeof STRINGS["en"]];
      return typeof value === "function" ? value(params || {}) : value;
    };
  }, [lang]);

  // cycle through English → Hindi → Hinglish
  const toggleLang = () =>
    setLang((l) => (l === "en" ? "hi" : l === "hi" ? "hi_en" : "en"));

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
