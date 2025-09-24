import { useState, useEffect } from "react";
import i18next from "../i18n"; // import i18n của bạn

export default function useLanguage() {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("GenZStyle_language") || "en"
  );

  const changeLanguage = (lang: string) => {
    if (lang !== language) {
      localStorage.setItem("GenZStyle_language", lang);
      i18next.changeLanguage(lang); // đổi ngôn ngữ i18n
      setLanguage(lang);
    }
  };

  // Sync state với localStorage khi mount
  useEffect(() => {
    const savedLang = localStorage.getItem("GenZStyle_language");
    if (savedLang && savedLang !== language) {
      setLanguage(savedLang);
      i18next.changeLanguage(savedLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { language, changeLanguage, setLanguage };
}
