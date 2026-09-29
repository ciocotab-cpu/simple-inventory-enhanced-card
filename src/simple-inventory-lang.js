import { langEn } from './simple-inventory-lang-en.js';
import { langFr } from './simple-inventory-lang-fr.js';
import { langDe } from './simple-inventory-lang-de.js';
import { langEs } from './simple-inventory-lang-es.js';
import { langIt } from './simple-inventory-lang-it.js';

export const languages = {
  it: langIt,
  en: langEn,
  fr: langFr,
  de: langDe,
  es: langEs
};

export function getTranslation(hass) {
   const haLang = hass && hass.language ? hass.language.split("-") : "it";
  // const haLang = "en"; // <-- Forza l'INGLESE
  // const haLang = "fr"; // <-- Forza il FRANCESE
  // const haLang = "de"; // <-- Forza il TEDESCO
  
  return languages[haLang] || languages["en"];
}
