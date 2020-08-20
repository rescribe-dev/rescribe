import {
  PurchaseState,
  PurchaseActionTypes,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
} from './types';

const initialState: PurchaseState = {
  cart: [],
};

export const purchaseReducer = (
  state = initialState,
  action: PurchaseActionTypes
): PurchaseState => {
  switch (action.type) {
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
