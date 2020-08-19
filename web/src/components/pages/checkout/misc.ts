import ObjectId from 'bson-objectid';
import { CreditCardBrand } from 'lib/generated/datamodel';

export type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined
) => void;

export type UpdateMethod = (args?: {
  id?: ObjectId;
  init?: boolean;
}) => Promise<void>;

export const creditCardBrandToString = (brand: CreditCardBrand): string => {
  switch (brand) {
    case CreditCardBrand.Amex:
      return 'American Express';
    case CreditCardBrand.Diners:
      return 'Diners';
    case CreditCardBrand.Discover:
      return 'Discover';
    case CreditCardBrand.Jcb:
      return 'JCB';
    case CreditCardBrand.Mastercard:
      return 'Mastercard';
    case CreditCardBrand.Unionpay:
      return 'Union Pay';
    case CreditCardBrand.Visa:
      return 'Visa Card';
    default:
      return 'Credit Card';
  }
};
