import enUS from "./locales/default.en-US.json";
import arAE from "./locales/ar-AE.json";
import elGR from "./locales/el-GR.json";
import heIL from "./locales/he-IL.json";
import ruRU from "./locales/ru-RU.json";
import zn from "./locales/zn.json";
import { getUserLocales } from "get-user-locale";
import { TextAttributes } from "../lib/types/TextAttributes";

export type LocaleData = {
  locale: string;
  messages: TextAttributes;
};

export type LocaleLoader = {
  name: string;
  load: () => Promise<LocaleData>;
};

function staticLoad(data: LocaleData): () => Promise<LocaleData> {
  return async () => data;
}

// function dynamicLoad(resource: string): () => Promise<LocaleData> {
//   return async () => {
//     const response = await axios.get<LocaleData>(resource);
//     if (response.status !== HttpStatus.OK) {
//       throw new Error(
//         `Error loading locale ${resource}: ${response.statusText}`
//       );
//     }
//     return response.data;
//   };
// }

/**
 * Pattern to extract language from the locale identifier.
 */
const languagePattern = /^(?<language>[a-zA-Z]+)[-_]?/;

/**
 * Default locale
 */
const defaultLocale: LocaleLoader = { name: "en-US", load: staticLoad(enUS) };

/**
 * Available locales
 */
const availableLocales: LocaleLoader[] = [
  defaultLocale,
  { name: "ar-AE", load: staticLoad(arAE) },
  { name: "el-GR", load: staticLoad(elGR) },
  { name: "he-IL", load: staticLoad(heIL) },
  { name: "ru-RU", load: staticLoad(ruRU) },
  { name: "zn", load: staticLoad(zn) },
];

/**
 * Parse locale identifier and return language name.
 */
function getLanguage(localeIdentifier: string): string | undefined {
  const match = languagePattern.exec(localeIdentifier);
  return match?.groups?.language;
}

/**
 * Retrieve best fit from the available locales.
 */
function selectLocale(
  wanted: string,
  available: LocaleLoader[]
): LocaleLoader | undefined {
  // Find exact match
  const exact = available.find((locale) => locale.name === wanted);
  if (exact != null) {
    return exact;
  }

  // Find language match otherwise
  const language = getLanguage(wanted);
  return available.find((locale) => getLanguage(locale.name) === language);
}

function resolveLocale(
  preferred: string[],
  available: LocaleLoader[]
): LocaleLoader {
  for (const locale of preferred) {
    const found = selectLocale(locale, available);
    if (found != null) {
      return found;
    }
  }
  return defaultLocale;
}

export function detectLocale(): LocaleLoader {
  return resolveLocale(getUserLocales(), availableLocales);
}
