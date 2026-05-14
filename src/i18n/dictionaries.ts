import { LocaleCode } from './config';

const dictionaries = {
  es: () => import('./es.json').then((module) => module.default),
  pt: () => import('./pt.json').then((module) => module.default),
};

export const getDictionary = async (locale: LocaleCode) => {
  if (!dictionaries[locale]) {
    return dictionaries['es'](); // Fallback to Spanish
  }
  return dictionaries[locale]();
};
