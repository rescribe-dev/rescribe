import { isSSR } from './checkSSR';
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { setLanguage } from 'state/settings/actions';
import { languageOptions, defaultLanguage } from './languages';

const getCurrentLanguageFromURL = (): string => {
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

  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
    dispatch(setLanguage(currentLanguage));
  }

  return currentLanguage;
};

export default getCurrentLanguageFromURL;
