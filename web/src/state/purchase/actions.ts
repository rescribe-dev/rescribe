import {
  PurchaseActionTypes,
  SET_DISPLAY_CURRENCY,
  SET_PAYMENT_CURRENCY,
} from './types';

export const setDisplayCurrency = (
  displayCurrency: string
): PurchaseActionTypes => {
  return {
    type: SET_DISPLAY_CURRENCY,
    payload: displayCurrency,
  };
};

export const setPaymentCurrency = (
  paymentCurrency: string
): PurchaseActionTypes => {
  return {
    type: SET_PAYMENT_CURRENCY,
    payload: paymentCurrency,
  };
};
