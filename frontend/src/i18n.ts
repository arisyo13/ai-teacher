import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import el from "./locales/el.json";

const resources = {
  en: { translation: en },
  el: { translation: el },
};

const savedLng = typeof window !== "undefined" ? localStorage.getItem("i18n_lng") : null;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLng ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("i18n_lng", lng);
  }
});

export default i18n;
