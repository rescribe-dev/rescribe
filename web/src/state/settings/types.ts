import { Theme } from 'utils/theme';

export interface CurrencyData {
  name: string;
  exchangeRate: number;
}

export interface SettingsState {
  language: string;
  theme: Theme;
  displayCurrency: CurrencyData;
}

export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_THEME = 'SET_THEME';
export const SET_DISPLAY_CURRENCY = 'SET_DISPLAY_CURRENCY';

interface SetLanguageAction {
  type: typeof SET_LANGUAGE;
  payload: string;
}

interface SetThemeAction {
  type: typeof SET_THEME;
  payload: Theme;
}

interface SetDisplayCurrencyAction {
  type: typeof SET_DISPLAY_CURRENCY;
  payload: CurrencyData;
}

export type SettingsActionTypes =
  | SetLanguageAction
  | SetThemeAction
  | SetDisplayCurrencyAction;
