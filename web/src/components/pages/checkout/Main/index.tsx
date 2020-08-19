import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form } from 'reactstrap';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import Summary from '../Summary';
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
  PurchaseMutation,
  PurchaseMutationVariables,
  Purchase,
} from 'lib/generated/datamodel';
import { toast } from 'react-toastify';
import { ApolloQueryResult } from 'apollo-client';
import ObjectId from 'bson-objectid';
import SelectList from '../SelectList';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import DeleteAddressModal from 'components/modals/DeleteAddress';
import { useMutation, ApolloError } from '@apollo/react-hooks';
import StepLayout from '../StepLayout';
import { Mode } from '../mode';
import DeletePaymentMethodModal from 'components/modals/DeletePaymentMethod';
import WritePaymentMethod from 'components/modals/WritePaymentMethod';
import { CurrencyData, CartObject } from 'state/purchase/types';
import { defaultCurrencyData } from 'state/purchase/reducers';
import { UpdateMethod, creditCardBrandToString, CheckoutValues } from '../misc';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';

export type OnCheckoutComplete = (name: string) => void;

interface CheckoutMainProps {
  messages: CheckoutMessages;
  onCheckoutComplete: OnCheckoutComplete;
}

const Main = (args: CheckoutMainProps): JSX.Element => {
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
        <p>
          <b>{creditCardBrandToString(paymentMethod.brand)}</b> ending in{' '}
          {paymentMethod.lastFourDigits}, charged in{' '}
          {paymentMethod.currency.toUpperCase()}
        </p>
      </>
    );
  };

  const [checkoutInitialValues] = useState<CheckoutValues>({
    address: null,
    paymentMethod: null,
  });

  const cart = isSSR
    ? undefined
    : useSelector<RootState, CartObject[] | undefined>(
        (state) => state.purchaseReducer.cart
      );
  const [coupon] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      await updateAddresses({
        init: true,
      });
      await updatePaymentMethods({
        init: true,
      });
    })();
  }, []);

  return (
    <>
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
            if (!cart || cart.length === 0) {
              throw new Error('cart is empty');
            }
            const itemToPurchase = cart[0];
            const purchaseRes = await client.mutate<
              PurchaseMutation,
              PurchaseMutationVariables
            >({
              mutation: Purchase,
              variables: {
                paymentMethod: formData.paymentMethod,
                interval: itemToPurchase.interval,
                product: itemToPurchase.name,
                coupon,
              },
            });
            if (purchaseRes.errors) {
              throw new Error(purchaseRes.errors.join(', '));
            }
            if (!purchaseRes.data) {
              throw new Error('cannot find purchase data');
            }
            args.onCheckoutComplete(itemToPurchase.displayName);
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
                      numItems={addresses ? addresses.data.addresses.length : 0}
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
                    formData={values}
                    cart={cart}
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
                      const newAddresses = addresses.data.addresses.filter(
                        (elem) => !(elem._id as ObjectId).equals(currentAddress)
                      );
                      if (newAddresses.length === 1) {
                        setFieldValue('address', newAddresses[0]._id);
                      } else if (
                        values.address &&
                        values.address.equals(currentAddress)
                      ) {
                        setFieldValue('address', null);
                      }
                      setAddresses({
                        ...addresses,
                        loading: false,
                        data: {
                          addresses: newAddresses,
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
                      const newPaymentMethods = paymentMethods.data.paymentMethods.filter(
                        (elem) =>
                          !(elem._id as ObjectId).equals(currentPaymentMethod)
                      );
                      if (newPaymentMethods.length === 1) {
                        setFieldValue(
                          'paymentMethod',
                          newPaymentMethods[0]._id
                        );
                      } else if (
                        values.paymentMethod &&
                        values.paymentMethod.equals(currentPaymentMethod)
                      ) {
                        setFieldValue('paymentMethod', null);
                      }
                      setPaymentMethods({
                        ...paymentMethods,
                        loading: false,
                        data: {
                          paymentMethods: newPaymentMethods,
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
    </>
  );
};

export default Main;
