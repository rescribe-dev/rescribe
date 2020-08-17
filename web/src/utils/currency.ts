import { CurrencyData } from 'state/purchase/types';
import getCurrentLanguage from 'utils/language';

const formatCurrency = (amount: number, currency: CurrencyData): string => {
  return new Intl.NumberFormat(getCurrentLanguage(), {
    style: 'currency',
    currency: currency.name,
  }).format(currency.exchangeRate * amount);
};

export default formatCurrency;
