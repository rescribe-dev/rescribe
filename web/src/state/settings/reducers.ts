import {
  SET_DISPLAY_CURRENCY,
  SettingsActionTypes,
  SettingsState,
  CurrencyData,
  SET_LANGUAGE,
  SET_THEME,
} from './types';
import { defaultCurrency } from 'shared/variables';
import { Theme } from 'utils/theme';
import { defaultLanguage } from 'utils/languages';

export const defaultCurrencyData: CurrencyData = {
  exchangeRate: 1,
  name: defaultCurrency,
};

const initialState: SettingsState = {
  displayCurrency: defaultCurrencyData,
  language: defaultLanguage,
  theme: Theme.light,
};

export const settingsReducer = (
  state = initialState,
  action: SettingsActionTypes
): SettingsState => {
  switch (action.type) {
    case SET_DISPLAY_CURRENCY:
      return {
        ...state,
        displayCurrency: action.payload,
      };
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };
    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};
