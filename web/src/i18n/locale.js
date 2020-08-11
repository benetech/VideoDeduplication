import enUS from "./locales/default.en-US.json";
import arAE from "./locales/ar-AE.json";
import elGR from "./locales/el-GR.json";
import heIL from "./locales/he-IL.json";
import ruRU from "./locales/ru-RU.json";
import zn from "./locales/zn.json";
import { getUserLocales } from "get-user-locale";
import * as HttpStatus from "http-status-codes";
import axios from "axios";

function staticLoad(data) {
  return async () => data;
}

function dynamicLoad(resource) {
  return async function () {
    const response = await axios.get(resource);
    if (response.status !== HttpStatus.OK) {
      throw new Error(
        `Error loading locale ${this.name}: ${response.statusText}`
      );
    }
    return response.data;
  };
}

/**
 * Pattern to extract language from the locale identifier.
 */
const languagePattern = /^(?<language>[a-zA-Z]+)[\-_]?/;

/**
 * Default locale
 */
const defaultLocale = { name: "en-US", load: staticLoad(enUS) };

/**
 * Available locales
 */
const availableLocales = [
  defaultLocale,
  { name: "ar-AE", load: dynamicLoad(arAE) },
  { name: "el-GR", load: dynamicLoad(elGR) },
  { name: "he-IL", load: dynamicLoad(heIL) },
  { name: "ru-RU", load: dynamicLoad(ruRU) },
  { name: "zn", load: dynamicLoad(zn) },
];

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
      return found;
    }
  }
  return defaultLocale;
}

export function detectLocale() {
  return resolveLocale(getUserLocales(), availableLocales);
}
