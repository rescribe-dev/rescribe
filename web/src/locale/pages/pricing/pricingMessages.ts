// info for product, written in specific language
export interface ProductInfo {
  name: string;
  caption: string;
  features: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PricingMessages {
  month: string;
  year: string;
  monthly: string;
  yearly: string;
  subscribe: string;
  products: Record<string, ProductInfo>;
}
