import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form } from 'reactstrap';
import './index.scss';
import { PageProps } from 'gatsby';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import Summary from './Summary';
import useScript from 'react-script-hook';
import getCurrentLanguage from 'utils/language';
import WriteAddress from 'components/modals/WriteAddress';
import { client } from 'utils/apollo';
import {
  AddressesQuery,
  AddressesQueryVariables,
  Addresses,
  AddressDataFragment,
  DeleteAddressMutation,
  DeleteAddressMutationVariables,
  DeleteAddress,
  PaymentMethodsQuery,
  PaymentMethodsQueryVariables,
  PaymentMethods,
  PaymentMethodDataFragment,
  DeletePaymentMethodMutation,
  DeletePaymentMethodMutationVariables,
  DeletePaymentMethod,
} from 'lib/generated/datamodel';
import { toast } from 'react-toastify';
import { ApolloQueryResult } from 'apollo-client';
import ObjectId from 'bson-objectid';
import SelectList from './SelectList';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import DeleteAddressModal from 'components/modals/DeleteAddress';
import { useMutation, ApolloError } from '@apollo/react-hooks';
import StepLayout from './StepLayout';
import { Mode } from './mode';
import DeletePaymentMethodModal from 'components/modals/DeletePaymentMethod';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import WritePaymentMethod from 'components/modals/WritePaymentMethod';
import { CurrencyData } from 'state/purchase/types';
import { defaultCurrencyData } from 'state/purchase/reducers';
import { UpdateMethod } from './types';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

interface CheckoutValues {
  address: ObjectId | null;
  paymentMethod: ObjectId | null;
}

const CheckoutPage = (args: CheckoutPageContentProps): JSX.Element => {
  const [addressModalIsOpen, setAddressModalIsOpen] = useState(false);
  const toggleAddressModal = () => setAddressModalIsOpen(!addressModalIsOpen);
  const [paymentModalIsOpen, setPaymentModalIsOpen] = useState(false);
  const togglePaymentModal = () => setPaymentModalIsOpen(!paymentModalIsOpen);

  const [addressSelectMode, setAddressSelectMode] = useState(true);
  const toggleAddressSelectMode = () =>
    setAddressSelectMode(!addressSelectMode);
  const [paymentSelectMode, setPaymentSelectMode] = useState(false);
  const togglePaymentSelectMode = () =>
    setPaymentSelectMode(!paymentSelectMode);

  const [deleteAddressModalIsOpen, setDeleteAddressModalIsOpen] = useState(
    false
  );
  const toggleDeleteAddressModal = () =>
    setDeleteAddressModalIsOpen(!deleteAddressModalIsOpen);
  const [deletePaymentModalIsOpen, setDeletePaymentModalIsOpen] = useState(
    false
  );
  const toggleDeletePaymentModal = () =>
    setDeletePaymentModalIsOpen(!deletePaymentModalIsOpen);

  const [currentAddress, setCurrentAddress] = useState<ObjectId | undefined>(
    undefined
  );
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<
    ObjectId | undefined
  >(undefined);

  const [deleteAddressMutation] = useMutation<
    DeleteAddressMutation,
    DeleteAddressMutationVariables
  >(DeleteAddress);
  const [deletePaymentMethodMutation] = useMutation<
    DeletePaymentMethodMutation,
    DeletePaymentMethodMutationVariables
  >(DeletePaymentMethod);

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyData>(
    defaultCurrencyData
  );

  const language = getCurrentLanguage();
  const [mapsScriptLoading] = useScript({
    src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GATSBY_GOOGLE_PLACES_AUTOCOMPLETE_KEY}&libraries=places&language=${language}`,
    checkForExisting: true,
  });
  // add vs edit
  const [add, setAdd] = useState(true);

  const formRef = useRef<FormikValues>();

  const [addresses, setAddresses] = useState<
    ApolloQueryResult<AddressesQuery> | undefined
  >(undefined);

  const updateAddresses: UpdateMethod = async (args) => {
    try {
      const addressesRes = await client.query<
        AddressesQuery,
        AddressesQueryVariables
      >({
        query: Addresses,
        variables: {},
        fetchPolicy: 'network-only',
      });
      addressesRes.data.addresses.map((address) => {
        address._id = new ObjectId(address._id);
      });
      setAddresses(addressesRes);
      if (args && formRef.current) {
        if (args.id) {
          const newAddressIndex = addressesRes.data.addresses.findIndex(
            (elem) => (elem._id as ObjectId).equals(args.id as ObjectId)
          );
          if (newAddressIndex >= 0 && formRef.current) {
            formRef.current.setFieldValue('address', args.id);
            setAddressSelectMode(false);
          }
        } else if (args.init && addressesRes.data.addresses.length > 0) {
          formRef.current.setFieldValue(
            'address',
            addressesRes.data.addresses[0]._id
          );
        }
      }
    } catch (err) {
      const errObj = err as Error;
      toast(errObj.message, {
        type: 'error',
      });
    }
  };

  const [paymentMethods, setPaymentMethods] = useState<
    ApolloQueryResult<PaymentMethodsQuery> | undefined
  >(undefined);

  const updatePaymentMethods: UpdateMethod = async (args) => {
    try {
      const paymentMethodsRes = await client.query<
        PaymentMethodsQuery,
        PaymentMethodsQueryVariables
      >({
        query: PaymentMethods,
        variables: {},
        fetchPolicy: 'network-only',
      });
      paymentMethodsRes.data.paymentMethods.map((method) => {
        method._id = new ObjectId(method._id);
      });
      setPaymentMethods(paymentMethodsRes);
      if (args && formRef.current) {
        if (args.id) {
          const newPaymentMethodIndex = paymentMethodsRes.data.paymentMethods.findIndex(
            (elem) => (elem._id as ObjectId).equals(args.id as ObjectId)
          );
          if (newPaymentMethodIndex >= 0) {
            formRef.current.setFieldValue('paymentMethod', args.id);
            setPaymentSelectMode(false);
          }
        } else if (
          args.init &&
          paymentMethodsRes.data.paymentMethods.length > 0
        ) {
          formRef.current.setFieldValue(
            'paymentMethod',
            paymentMethodsRes.data.paymentMethods[0]._id
          );
        }
      }
    } catch (err) {
      const errObj = err as Error;
      toast(errObj.message, {
        type: 'error',
      });
    }
  };

  const getAddressListLabel = (address: AddressDataFragment): JSX.Element => {
    return (
      <>
        <p>
          <b>{address.name}:</b> {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
          {address.state}, {address.country} {address.postal_code}
        </p>
      </>
    );
  };

  const getPaymentListLabel = (
    paymentMethod: PaymentMethodDataFragment
  ): JSX.Element => {
    return (
      <>
        <p>payment method in {paymentMethod.currency}</p>
      </>
    );
  };

  const [checkoutInitialValues] = useState<CheckoutValues>({
    address: null,
    paymentMethod: null,
  });

  const [
    stripeElement,
    setStripeElement,
  ] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    (async () => {
      if (!process.env.GATSBY_STRIPE_SITE_KEY) {
        throw new Error('cannot find stripe key');
      }
      setStripeElement(loadStripe(process.env.GATSBY_STRIPE_SITE_KEY));
      await updateAddresses({
        init: true,
      });
      await updatePaymentMethods({
        init: true,
      });
    })();
  }, []);

  return (
    <Elements stripe={stripeElement}>
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <h2
          className="text-center"
          style={{
            marginBottom: '3rem',
          }}
        >
          Checkout
        </h2>
        <Formik
          innerRef={(formRef as unknown) as (instance: any) => void}
          initialValues={checkoutInitialValues}
          validationSchema={yup.object({
            address: yup.object().required('required'),
            paymentMethod: yup.object().required('required'),
          })}
          onSubmit={async (
            formData,
            { setSubmitting, setStatus }
          ): Promise<void> => {
            try {
              // run checkout
              console.log(formData);
            } catch (err) {
              toast(err.message, {
                type: 'error',
              });
              setStatus({ success: false });
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, handleSubmit }) => (
            <>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="7">
                    <Container>
                      <StepLayout
                        loading={addresses === undefined || addresses.loading}
                        messages={args.messages}
                        mode={Mode.Address}
                        numItems={
                          addresses ? addresses.data.addresses.length : 0
                        }
                        selectMode={addressSelectMode}
                        toggle={() => {
                          if (paymentSelectMode) {
                            togglePaymentSelectMode();
                          }
                          toggleAddressSelectMode();
                        }}
                      >
                        <SelectList
                          getListLabel={getAddressListLabel}
                          getSelectedLabel={getAddressListLabel}
                          items={addresses ? addresses.data.addresses : []}
                          messages={args.messages}
                          mode={Mode.Address}
                          toggleModal={toggleAddressModal}
                          setAdd={setAdd}
                          updateItems={updateAddresses}
                          selectedID={values.address}
                          setFieldValue={setFieldValue}
                          selectMode={addressSelectMode}
                          setCurrentItem={setCurrentAddress}
                          toggleDeleteItemModal={toggleDeleteAddressModal}
                          id="address"
                        />
                      </StepLayout>
                      <hr />
                      <StepLayout
                        loading={
                          paymentMethods === undefined || paymentMethods.loading
                        }
                        messages={args.messages}
                        mode={Mode.Payment}
                        numItems={
                          paymentMethods
                            ? paymentMethods.data.paymentMethods.length
                            : 0
                        }
                        selectMode={paymentSelectMode}
                        toggle={() => {
                          if (addressSelectMode) {
                            toggleAddressSelectMode();
                          }
                          togglePaymentSelectMode();
                        }}
                      >
                        <SelectList
                          getListLabel={getPaymentListLabel}
                          getSelectedLabel={getPaymentListLabel}
                          items={
                            paymentMethods
                              ? paymentMethods.data.paymentMethods
                              : []
                          }
                          messages={args.messages}
                          mode={Mode.Payment}
                          toggleModal={togglePaymentModal}
                          setAdd={setAdd}
                          updateItems={updatePaymentMethods}
                          selectedID={values.paymentMethod}
                          setFieldValue={setFieldValue}
                          selectMode={paymentSelectMode}
                          setCurrentItem={setCurrentPaymentMethod}
                          toggleDeleteItemModal={toggleDeletePaymentModal}
                          id="paymentMethod"
                          setCurrentCurrency={setCurrentCurrency}
                        />
                      </StepLayout>
                    </Container>
                  </Col>
                  <Col md="4">
                    <Summary
                      messages={args.messages}
                      currency={currentCurrency}
                    />
                  </Col>
                </Row>
              </Form>
              <DeleteAddressModal
                isOpen={deleteAddressModalIsOpen}
                toggle={toggleDeleteAddressModal}
                deleteAddress={async (): Promise<void> => {
                  if (!addresses || !currentAddress) return;
                  try {
                    await deleteAddressMutation({
                      variables: {
                        id: currentAddress,
                      },
                      update: () => {
                        if (
                          values.address &&
                          values.address.equals(currentAddress)
                        ) {
                          setFieldValue('address', null);
                        }
                        setAddresses({
                          ...addresses,
                          loading: false,
                          data: {
                            addresses: addresses.data.addresses.filter(
                              (elem) =>
                                !(elem._id as ObjectId).equals(currentAddress)
                            ),
                          },
                        });
                      },
                    });
                  } catch (err) {
                    const errObj = err as ApolloError;
                    toast(errObj.message, {
                      type: 'error',
                    });
                  }
                }}
              />
              <DeletePaymentMethodModal
                isOpen={deletePaymentModalIsOpen}
                toggle={toggleDeletePaymentModal}
                deletePaymentMethod={async (): Promise<void> => {
                  if (!paymentMethods || !currentPaymentMethod) return;
                  try {
                    await deletePaymentMethodMutation({
                      variables: {
                        id: currentPaymentMethod,
                      },
                      update: () => {
                        if (
                          values.address &&
                          values.address.equals(currentPaymentMethod)
                        ) {
                          setFieldValue('paymentMethod', null);
                        }
                        setPaymentMethods({
                          ...paymentMethods,
                          loading: false,
                          data: {
                            paymentMethods: paymentMethods.data.paymentMethods.filter(
                              (elem) =>
                                !(elem._id as ObjectId).equals(
                                  currentPaymentMethod
                                )
                            ),
                          },
                        });
                      },
                    });
                  } catch (err) {
                    const errObj = err as ApolloError;
                    toast(errObj.message, {
                      type: 'error',
                    });
                  }
                }}
              />
            </>
          )}
        </Formik>
      </Container>
      <WritePaymentMethod
        add={add}
        isOpen={paymentModalIsOpen}
        toggle={togglePaymentModal}
        updatePaymentMethods={updatePaymentMethods}
      />
      {mapsScriptLoading ? null : (
        <WriteAddress
          add={add}
          isOpen={addressModalIsOpen}
          toggle={toggleAddressModal}
          updateAddresses={updateAddresses}
        />
      )}
    </Elements>
  );
};

export default CheckoutPage;
