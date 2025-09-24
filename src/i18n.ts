// i18n.ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

const savedLanguage = localStorage.getItem("GenZStyle_language") || "en";

i18next.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React đã escape sẵn
  },
  resources: {
    en: en , // thêm key 'translation' là namespace mặc định
    vi:  vi ,
  },
});

export default i18next;
