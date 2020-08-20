import {
  PurchaseActionTypes,
  CartObject,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
} from './types';
import { store } from 'state/reduxWrapper';
import { RootState } from 'state';

export const addToCart = (item: CartObject): PurchaseActionTypes => {
  return {
    type: ADD_TO_CART,
    payload: item,
  };
};

export const removeFromCart = (name: string): PurchaseActionTypes => {
  const state = store.getState() as RootState;
  const index = state.purchaseReducer.cart.findIndex(
    (current) => current.name === name
  );
  return {
    type: REMOVE_FROM_CART,
    payload: index,
  };
};

export const clearCart = (): PurchaseActionTypes => {
  return {
    type: CLEAR_CART,
  };
};
