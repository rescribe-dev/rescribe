import { IntervalType } from 'lib/generated/datamodel';

export interface CurrencyData {
  name: string;
  exchangeRate: number;
}

export interface CartObject {
  name: string;
  interval: IntervalType;
  price: number;
}

export interface PurchaseState {
  displayCurrency: CurrencyData;
  paymentCurrency: CurrencyData;
  cart: CartObject[];
}

export const SET_DISPLAY_CURRENCY = 'SET_DISPLAY_CURRENCY';
export const SET_PAYMENT_CURRENCY = 'SET_PAYMENT_CURRENCY';
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

interface SetDisplayCurrencyAction {
  type: typeof SET_DISPLAY_CURRENCY;
  payload: CurrencyData;
}
interface SetPaymentCurrencyAction {
  type: typeof SET_PAYMENT_CURRENCY;
  payload: CurrencyData;
}

interface AddToCartAction {
  type: typeof ADD_TO_CART;
  payload: CartObject;
}

interface RemoveFromCartAction {
  type: typeof REMOVE_FROM_CART;
  payload: number;
}

export type PurchaseActionTypes =
  | SetDisplayCurrencyAction
  | SetPaymentCurrencyAction
  | AddToCartAction
  | RemoveFromCartAction;
