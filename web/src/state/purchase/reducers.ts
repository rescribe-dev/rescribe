import {
  PurchaseState,
  SET_DISPLAY_CURRENCY,
  PurchaseActionTypes,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CurrencyData,
  CLEAR_CART,
} from './types';
import { defaultCurrency } from 'shared/variables';

export const defaultCurrencyData: CurrencyData = {
  exchangeRate: 1,
  name: defaultCurrency,
};

const initialState: PurchaseState = {
  displayCurrency: defaultCurrencyData,
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
    case ADD_TO_CART:
      if (!state.cart.find((item) => item.name === action.payload.name)) {
        state.cart.push(action.payload);
      }
      return {
        ...state,
      };
    case REMOVE_FROM_CART:
      if (action.payload >= 0) {
        state.cart.splice(action.payload, 1);
      }
      return {
        ...state,
      };
    case CLEAR_CART:
      return {
        ...state,
        cart: [],
      };
    default:
      return state;
  }
};
