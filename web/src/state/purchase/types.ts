import ObjectID from 'bson-objectid';
import { IntervalType } from 'lib/generated/datamodel';

export interface PurchaseState {
  displayCurrency: string;
  paymentCurrency: string;
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
  payload: string;
}
interface SetPaymentCurrencyAction {
  type: typeof SET_PAYMENT_CURRENCY;
  payload: string;
}

export type PurchaseActionTypes =
  | SetDisplayCurrencyAction
  | SetPaymentCurrencyAction;
