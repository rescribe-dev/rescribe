import ObjectID from 'bson-objectid';
import { IntervalType } from 'lib/generated/datamodel';

export interface CurrencyData {
  name: string;
  exchangeRate: number;
}

export interface PurchaseState {
  displayCurrency: CurrencyData;
  paymentCurrency: CurrencyData;
  cart: {
    id: ObjectID;
    name: string;
    interval: IntervalType;
    price: number;
  }[];
}

export const SET_DISPLAY_CURRENCY = 'SET_DISPLAY_CURRENCY';
export const SET_PAYMENT_CURRENCY = 'SET_PAYMENT_CURRENCY';

interface SetDisplayCurrencyAction {
  type: typeof SET_DISPLAY_CURRENCY;
  payload: CurrencyData;
}
interface SetPaymentCurrencyAction {
  type: typeof SET_PAYMENT_CURRENCY;
  payload: CurrencyData;
}

export type PurchaseActionTypes =
  | SetDisplayCurrencyAction
  | SetPaymentCurrencyAction;
