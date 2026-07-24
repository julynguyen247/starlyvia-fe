import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { en, type MessageKey, vi } from '../i18n/messages';

export type AppLanguage = 'en' | 'vi';
type MessageParams = Record<string, number | string>;

type LanguageContextValue = {
  language: AppLanguage;
  locale: 'en-US' | 'vi-VN';
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
};

const LANGUAGE_KEY = 'starlyvia.language.v1';
const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is AppLanguage {
  return value === 'en' || value === 'vi';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('vi');
  const userSelectedLanguage = useRef(false);

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync(LANGUAGE_KEY)
      .then((storedLanguage) => {
        if (active && !userSelectedLanguage.current && isLanguage(storedLanguage)) {
          setLanguageState(storedLanguage);
        }
      })
      .catch(() => {
        // Vietnamese remains the safe default when secure storage is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    userSelectedLanguage.current = true;
    setLanguageState(nextLanguage);
    void SecureStore.setItemAsync(LANGUAGE_KEY, nextLanguage).catch(() => {
      // Keep the current selection usable even when the device cannot persist it.
    });
  }, []);

  const t = useCallback((key: MessageKey, params: MessageParams = {}) => {
    const template = (language === 'vi' ? vi : en)[key];
    return Object.entries(params).reduce(
      (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
      template,
    );
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale: language === 'vi' ? 'vi-VN' : 'en-US',
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
