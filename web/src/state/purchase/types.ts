import { IntervalType } from 'lib/generated/datamodel';

export interface CartObject {
  name: string;
  displayName: string;
  interval: IntervalType;
  price: number;
}

export interface PurchaseState {
  cart: CartObject[];
}

export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const CLEAR_CART = 'CLEAR_CART';

interface AddToCartAction {
  type: typeof ADD_TO_CART;
  payload: CartObject;
}

interface RemoveFromCartAction {
  type: typeof REMOVE_FROM_CART;
  payload: number;
}

interface ClearCartAction {
  type: typeof CLEAR_CART;
}

export type PurchaseActionTypes =
  | AddToCartAction
  | RemoveFromCartAction
  | ClearCartAction;
