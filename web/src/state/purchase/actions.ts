import {
  PurchaseActionTypes,
  SET_DISPLAY_CURRENCY,
  SET_PAYMENT_CURRENCY,
  CurrencyData,
} from './types';

export const setDisplayCurrency = (
  displayCurrency: CurrencyData
): PurchaseActionTypes => {
  return {
    type: SET_DISPLAY_CURRENCY,
    payload: displayCurrency,
  };
};

export const setPaymentCurrency = (
  paymentCurrency: CurrencyData
): PurchaseActionTypes => {
  return {
    type: SET_PAYMENT_CURRENCY,
    payload: paymentCurrency,
  };
};
