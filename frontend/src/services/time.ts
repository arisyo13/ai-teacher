import { format, parseISO } from "date-fns";
import { el } from "date-fns/locale/el";
import { enUS } from "date-fns/locale/en-US";
import i18n from "@/i18n";

const LOCALES: Record<string, typeof enUS> = {
  en: enUS,
  "en-US": enUS,
  "en-GB": enUS,
  el: el,
  "el-GR": el,
};

const getLocale = (localeCode?: string) => {
  const code = localeCode ?? i18n.language;
  return code ? (LOCALES[code] ?? LOCALES[code.slice(0, 2)]) ?? enUS : enUS;
};

export const formatDate = (iso: string, localeCode?: string): string =>
  format(parseISO(iso), "MMMM d, yyyy", { locale: getLocale(localeCode) });
