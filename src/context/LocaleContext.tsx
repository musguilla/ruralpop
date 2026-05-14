'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { LocaleCode } from '@/i18n/config';

type Dictionary = any;

interface LocaleContextProps {
  locale: LocaleCode;
  dictionary: Dictionary;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider = ({
  locale,
  dictionary,
  children,
}: {
  locale: LocaleCode;
  dictionary: Dictionary;
  children: ReactNode;
}) => {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  
  const { locale, dictionary } = context;

  // Simple nested key resolver: "category.Tractores" -> dictionary["category"]["Tractores"]
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = dictionary;
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }
    return typeof value === 'string' ? value : '';
  };

  return { t, locale, dictionary };
};
