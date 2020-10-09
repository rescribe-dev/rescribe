import { isSSR } from './checkSSR';
import { languageOptions, defaultLanguage } from 'shared/languages';

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
    const splitURL = url.split('/').filter((val) => val.length > 0);
    // remove original selected language
    if (splitURL.length > 0 && languageOptions.includes(splitURL[0])) {
      splitURL.shift();
    }
    // add new language
    if (newLanguage !== defaultLanguage) {
      redirectURL = `/${newLanguage}`;
    }
    // add the rest of the url
    if (splitURL.length > 0) {
      redirectURL += `/${splitURL.join('/')}`;
    }
  }
  return redirectURL;
};
