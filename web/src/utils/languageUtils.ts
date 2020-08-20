import { isSSR } from './checkSSR';
import { languageOptions, defaultLanguage } from './languages';

export const getCurrentLanguageFromURL = (): string => {
  let currentLanguage = defaultLanguage;
  if (!isSSR) {
    const url = window.location.pathname;
    const splitURL = url.split('/');
    if (splitURL.length >= 2) {
      const urlLanguage = splitURL[1];
      if (languageOptions.includes(urlLanguage)) {
        currentLanguage = urlLanguage;
      }
    }
  }
  return currentLanguage;
};

export const getLanguageRedirectURL = (newLanguage: string): string => {
  let redirectURL = '';
  if (!isSSR) {
    const url = window.location.pathname;
    const splitURL = url.split('/');
    if (splitURL.length > 0 && languageOptions.includes(splitURL[0])) {
      splitURL.shift();
    }
    if (newLanguage !== defaultLanguage) {
      redirectURL = `/${newLanguage}`;
    }
    if (splitURL.length > 0) {
      redirectURL += `/${splitURL.join('/')}`;
    }
  }
  return redirectURL;
};
