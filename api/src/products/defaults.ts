import { defaultCurrency } from '../shared/variables';
import { AddProductArgs } from './addProduct.resolver';
import { Interval } from '../schema/payments/plan';

export const defaultAcceptedCurrencies: string[] = [defaultCurrency];

export const defaultProductName = 'free';

export const defaultProducts: AddProductArgs[] = [
  {
    name: defaultProductName,
    plans: [{
      amount: 0,
      interval: Interval.month
    }],
    storage: 1e9, // 1 gb
    privateRepositories: 2,
    publicRepositories: Number.MAX_SAFE_INTEGER
  },
  {
    name: 'team',
    plans: [{
      amount: 15,
      interval: Interval.month
    }, {
      amount: 150,
      interval: Interval.year
    }],
    storage: 15e9, // 15 gb
    privateRepositories: Number.MAX_SAFE_INTEGER,
    publicRepositories: Number.MAX_SAFE_INTEGER
  },
  {
    name: 'enterprise',
    plans: [{
      amount: 150,
      interval: Interval.month
    }, {
      amount: 1500,
      interval: Interval.year
    }],
    storage: Number.MAX_SAFE_INTEGER,
    privateRepositories: Number.MAX_SAFE_INTEGER,
    publicRepositories: Number.MAX_SAFE_INTEGER
  }
];
