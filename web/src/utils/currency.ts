import { CurrencyData } from 'state/settings/types';

const formatCurrency = (
  amount: number,
  currency: CurrencyData,
  language: string
): string => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency.name,
  }).format(currency.exchangeRate * amount);
};

export default formatCurrency;
