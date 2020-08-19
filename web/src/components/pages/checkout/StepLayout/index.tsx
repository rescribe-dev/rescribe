import React, { ReactNode } from 'react';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import { Row, Col } from 'reactstrap';
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
      <Row className="justify-content-between">
        <Col xs="auto">
          <h4>{capitalizeFirstLetter(name)}</h4>
        </Col>
        <Col xs="auto">
          {args.loading || args.numItems === 0 ? null : (
            <button
              className="button-link"
              style={{
                color: 'var(--dark-blue)',
              }}
              onClick={(evt) => {
                evt.preventDefault();
                args.toggle();
              }}
            >
              {!args.selectMode ? 'Change' : 'Close'}
            </button>
          )}
        </Col>
      </Row>
      {args.loading ? <p>loading...</p> : args.children}
    </>
  );
};

export default StepLayout;
