import React from 'react';
// import AsyncSelect from 'react-select/async';
import { Container } from 'reactstrap';

interface CurrencySelectorArgs {
  setPaymentCurrency: boolean;
}

const CurrencySelector = (_args: CurrencySelectorArgs): JSX.Element => {
  return (
    <>
      <Container>
        <p>currency selector</p>
      </Container>
    </>
  );
};

export default CurrencySelector;
