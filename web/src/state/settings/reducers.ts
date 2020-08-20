import {
  SET_DISPLAY_CURRENCY,
  SettingsActionTypes,
  SettingsState,
  CurrencyData,
} from './types';
import { defaultCurrency } from 'shared/variables';
import { Theme } from 'utils/theme';

export const defaultCurrencyData: CurrencyData = {
  exchangeRate: 1,
  name: defaultCurrency,
};

const initialState: SettingsState = {
  displayCurrency: defaultCurrencyData,
  language: 'en',
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
    default:
      return state;
  }
};
