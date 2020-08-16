import {
  PurchaseState,
  SET_DISPLAY_CURRENCY,
  SET_PAYMENT_CURRENCY,
  PurchaseActionTypes,
} from './types';
import { defaultCurrency } from 'shared/variables';

const initialState: PurchaseState = {
  displayCurrency: defaultCurrency,
  paymentCurrency: defaultCurrency,
  cart: [],
};

export const purchaseReducer = (
  state = initialState,
  action: PurchaseActionTypes
): PurchaseState => {
  switch (action.type) {
    case SET_DISPLAY_CURRENCY:
      return {
        ...state,
        displayCurrency: action.payload,
      };
    case SET_PAYMENT_CURRENCY:
      return {
        ...state,
        paymentCurrency: action.payload,
      };
    default:
      return state;
  }
};
