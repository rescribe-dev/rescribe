import {
  defaultProductName,
  teamProductName,
  enterpriseProductName,
} from 'shared/variables';

// info for product, written in specific language
export interface ProductInfo {
  name: string;
  caption: string;
  buttonColor: string;
  features: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PricingMessages {
  monthly: string;
  yearly: string;
  subscribe: string;
  products: {
    [defaultProductName]: ProductInfo;
    [teamProductName]: ProductInfo;
    [enterpriseProductName]: ProductInfo;
  };
}
