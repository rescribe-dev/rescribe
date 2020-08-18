import React, { ReactNode } from 'react';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import { Button } from 'reactstrap';
import { capitalizeFirstLetter } from 'utils/misc';
import { Mode } from '../mode';

interface StepLayoutArgs {
  messages: CheckoutMessages;
  mode: Mode;
  selectMode: boolean;
  loading: boolean;
  numItems: number;
  toggle: () => void;
  children?: ReactNode;
}

const StepLayout = (args: StepLayoutArgs): JSX.Element => {
  const name =
    args.mode === Mode.Address ? 'billing address' : 'payment method';
  return (
    <>
      <h4>{capitalizeFirstLetter(name)}</h4>
      {args.loading || args.numItems === 0 ? null : (
        <Button
          onClick={(evt) => {
            evt.preventDefault();
            args.toggle();
          }}
        >
          {args.selectMode ? 'Close' : 'Select'}
        </Button>
      )}
      {args.loading ? <p>loading...</p> : args.children}
    </>
  );
};

export default StepLayout;
