import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Container } from 'reactstrap';
import {
  CurrenciesQuery,
  CurrenciesQueryVariables,
  Currencies,
} from 'lib/generated/datamodel';
import { ValueType } from 'react-select';
import { isSSR } from 'utils/checkSSR';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'state';
import { Dispatch } from 'redux';
import { setPaymentCurrency, setDisplayCurrency } from 'state/purchase/actions';
import { useQuery, ApolloError } from '@apollo/react-hooks';
import isDebug from 'utils/mode';
import { toast } from 'react-toastify';
import { CurrencyData } from 'state/purchase/types';
import 'currency-flags/dist/currency-flags.css';

interface SelectObject {
  value: CurrencyData;
  label: JSX.Element;
}

interface CurrencySelectorArgs {
  setPaymentCurrency: boolean;
}

const CurrencySelector = (args: CurrencySelectorArgs): JSX.Element => {
  const [currencyOptions, setCurrencyOptions] = useState<SelectObject[]>([]);
  const getLabel = (currency: CurrencyData): JSX.Element => {
    return (
      <>
        <div
          style={{
            marginRight: '1rem',
          }}
          className={`currency-flag currency-flag-${currency.name}`}
        />
        {currency.name.toUpperCase()}
      </>
    );
  };
  const currentCurrency: SelectObject | undefined = isSSR
    ? undefined
    : useSelector<RootState, SelectObject>((state) => {
        const currency = args.setPaymentCurrency
          ? state.purchaseReducer.paymentCurrency
          : state.purchaseReducer.displayCurrency;
        return {
          value: currency,
          label: getLabel(currency),
        };
      });
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
    useQuery<CurrenciesQuery, CurrenciesQueryVariables>(Currencies, {
      variables: {},
      fetchPolicy: isDebug() ? 'no-cache' : 'cache-first', // disable cache if in debug
      onError: (err) => {
        toast((err as ApolloError).message, {
          type: 'error',
        });
      },
      onCompleted: (data) => {
        const newCurrencyOptions = data.currencies;
        setCurrencyOptions(
          newCurrencyOptions.map((currency) => {
            return {
              label: getLabel(currency),
              value: currency,
            };
          })
        );
        if (currentCurrency) {
          const newCurrencyData = newCurrencyOptions.find(
            (elem) => elem.name === currentCurrency.value.name
          );
          if (newCurrencyData) {
            if (args.setPaymentCurrency) {
              dispatch(setPaymentCurrency(newCurrencyData));
            } else {
              dispatch(setDisplayCurrency(newCurrencyData));
            }
          }
        }
      },
    });
  }
  const getCurrencies = async (inputValue: string): Promise<SelectObject[]> => {
    if (!currencyOptions) return [];
    return inputValue.length > 0
      ? currencyOptions.filter((currency) => {
          return currency.value.name
            .toLowerCase()
            .includes(inputValue.toLowerCase());
        })
      : currencyOptions;
  };
  return (
    <Container>
      <AsyncSelect
        id="currency"
        name="currency"
        isMulti={false}
        defaultOptions={currencyOptions}
        cacheOptions={true}
        loadOptions={getCurrencies}
        defaultValue={currentCurrency}
        onChange={(selectedOption: ValueType<SelectObject>) => {
          if (!selectedOption) {
            return;
          }
          const selected = selectedOption as SelectObject;
          if (args.setPaymentCurrency) {
            dispatch(setPaymentCurrency(selected.value));
          } else {
            dispatch(setDisplayCurrency(selected.value));
          }
        }}
      />
    </Container>
  );
};

export default CurrencySelector;
