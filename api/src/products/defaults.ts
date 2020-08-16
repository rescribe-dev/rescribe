import { defaultCurrency } from '../shared/variables';
import { AddProductArgs } from './addProduct.resolver';
import { defaultProductName } from './product.resolver';
import { Interval } from '../schema/payments/plan';

export const defaultAcceptedCurrencies: string[] = [defaultCurrency];

export const defaultProducts: AddProductArgs[] = [
  {
    name: defaultProductName,
    plans: [{
      amount: 0,
      interval: Interval.month
    }],
    storage: Number.MAX_SAFE_INTEGER
  }
];
