import {
  SettingsActionTypes,
  SET_DISPLAY_CURRENCY,
  CurrencyData,
  SET_LANGUAGE,
} from './types';
import { Theme } from 'utils/theme';

export const setDisplayCurrency = (
  displayCurrency: CurrencyData
): SettingsActionTypes => {
  return {
    type: SET_DISPLAY_CURRENCY,
    payload: displayCurrency,
  };
};

export const setLanguage = (language: string): SettingsActionTypes => {
  return {
    type: SET_LANGUAGE,
    payload: language,
  };
};

export const setTheme = (theme: Theme): SettingsActionTypes => {
  return {
    type: SET_LANGUAGE,
    payload: theme,
  };
};
