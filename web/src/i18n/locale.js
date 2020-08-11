import enUS from "./locales/default.en-US.json";
import arAE from "./locales/ar-AE.json";
import elGR from "./locales/el-GR.json";
import heIL from "./locales/he-IL.json";
import ruRU from "./locales/ru-RU.json";
import zn from "./locales/zn.json";
import { getUserLocales } from "get-user-locale";
import * as HttpStatus from "http-status-codes";
import axios from "axios";

/**
 * Pattern to extract language from the locale identifier.
 */
const languagePattern = /^(?<language>[a-zA-Z]+)[\-_]?/;

const availableLocales = [
  { name: "en-US", resource: enUS },
  { name: "ar-AE", resource: arAE },
  { name: "el-GR", resource: elGR },
  { name: "he-IL", resource: heIL },
  { name: "ru-RU", resource: ruRU },
  { name: "zn", resource: zn },
];

const defaultLocale = enUS;

/**
 * Parse locale identifier and return language name.
 */
function getLanguage(localeIdentifier) {
  const match = languagePattern.exec(localeIdentifier);
  return match && match.groups.language;
}

/**
 * Retrieve best fit from the available locales.
 */
function selectLocale(wanted, available) {
  // Find exact match
  const exact = available.find((locale) => locale.name === wanted);
  if (exact != null) {
    return exact;
  }

  // Find language match otherwise
  const language = getLanguage(wanted);
  return available.find((locale) => getLanguage(locale.name) === language);
}

function resolveLocale(preferred, available) {
  for (let locale of preferred) {
    const found = selectLocale(locale, available);
    if (found != null) {
      return found.resource;
    }
  }
  return defaultLocale;
}

export async function loadLocale() {
  const resource = resolveLocale(getUserLocales(), availableLocales);
  const response = await axios.get(resource);
  if (response.status !== HttpStatus.OK) {
    throw new Error(`Cannot load locale: ${response.statusText}`);
  }
  return response.data;
}
