// i18n.ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Import từng namespace JSON
import en from "./locales/en.json";
import vi from "./locales/vi.json";


i18next.use(initReactI18next).init({
  lng: "vi",
  fallbackLng: "en",
  ns: ["vi", "en"],
  defaultNS: "vi",
  resources: {
    en: en,
    vi: vi,
  },
});

export default i18next;
