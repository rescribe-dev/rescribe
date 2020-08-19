import React, { useState, useRef } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Container,
} from 'reactstrap';

import './index.scss';
import { Formik, FormikValues } from 'formik';
import { css } from '@emotion/core';

import BeatLoader from 'react-spinners/BeatLoader';
import { client } from 'utils/apollo';
import { toast } from 'react-toastify';
import {
  AddPaymentMethodMutation,
  AddPaymentMethodMutationVariables,
  AddPaymentMethod,
} from 'lib/generated/datamodel';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CurrencySelector from 'components/CurrencySelector';
import ObjectId from 'bson-objectid';
import { UpdateMethod } from 'components/pages/checkout/misc';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

interface WritePaymentMethodArgs {
  add: boolean;
  isOpen: boolean;
  toggle: () => void;
  updatePaymentMethods: UpdateMethod;
}

const WritePaymentMethod = (args: WritePaymentMethodArgs): JSX.Element => {
  const stripe = useStripe();
  const elements = useElements();

  const [validMethod, setValidMethod] = useState(false);

  const formRef = useRef<FormikValues>();

  return (
    <Modal
      isOpen={args.isOpen}
      toggle={args.toggle}
      onClosed={() => {
        if (formRef.current) {
          formRef.current.resetForm();
        }
      }}
    >
      <ModalHeader toggle={args.toggle}>
        {args.add ? 'Add' : 'Edit'} Payment Method
      </ModalHeader>
      <Formik
        innerRef={(formRef as unknown) as (instance: any) => void}
        enableReinitialize={true}
        initialValues={{
          currency: '',
        }}
        onSubmit={async (
          formData,
          { setSubmitting, setStatus }
        ): Promise<void> => {
          try {
            if (!stripe || !elements) {
              throw new Error('stripe or elements not found');
            }
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
              throw new Error('cannot find card element');
            }
            const paymentMethodRes = await stripe.createPaymentMethod({
              type: 'card',
              card: cardElement,
            });
            if (paymentMethodRes.error) {
              throw paymentMethodRes.error;
            }
            if (!paymentMethodRes.paymentMethod) {
              throw new Error('cannot find payment method');
            }

            const cardToken = paymentMethodRes.paymentMethod.id;
            if (!cardToken) {
              throw new Error('cannot find payment method id');
            }

            const addPaymentMethodRes = await client.mutate<
              AddPaymentMethodMutation,
              AddPaymentMethodMutationVariables
            >({
              mutation: AddPaymentMethod,
              variables: {
                currency: formData.currency,
                cardToken,
              },
            });
            if (addPaymentMethodRes.errors) {
              throw new Error(addPaymentMethodRes.errors.join(', '));
            }
            if (
              !addPaymentMethodRes.data ||
              !addPaymentMethodRes.data.addPaymentMethod._id
            ) {
              throw new Error(
                'cannot get id for payment method that was just created'
              );
            }
            const paymentMethodID = new ObjectId(
              addPaymentMethodRes.data.addPaymentMethod._id
            );
            await args.updatePaymentMethods({
              id: paymentMethodID,
            });
            args.toggle();
          } catch (err) {
            toast(err.message, {
              type: 'error',
            });
            setStatus({ success: false });
            setSubmitting(false);
          }
        }}
      >
        {({ handleSubmit, isSubmitting, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Container>
                <FormGroup
                  style={{
                    marginTop: '1rem',
                  }}
                >
                  <Container
                    style={{
                      marginTop: '2rem',
                      marginBottom: '2rem',
                    }}
                  >
                    <CardElement
                      id="payment-method"
                      onChange={(evt) => {
                        setValidMethod(evt.complete);
                      }}
                    />
                  </Container>
                </FormGroup>
                <FormGroup>
                  <CurrencySelector
                    displayCurrency={false}
                    acceptedPayment={true}
                    onChange={(currency) => setFieldValue('currency', currency)}
                  />
                </FormGroup>
              </Container>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                color="primary"
                style={{
                  width: '100%',
                  borderRadius: '23px',
                }}
                onClick={(evt: React.MouseEvent) => {
                  evt.preventDefault();
                  handleSubmit();
                }}
                disabled={isSubmitting || !validMethod}
              >
                Submit
              </Button>
              <BeatLoader
                css={loaderCSS}
                size={10}
                color="var(--red-stop)"
                loading={isSubmitting}
              />
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default WritePaymentMethod;
