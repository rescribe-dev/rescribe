import React, { useState, useEffect } from 'react';
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
} from 'lib/generated/datamodel';
import { toast } from 'react-toastify';
import { ApolloQueryResult } from 'apollo-client';
import ObjectId from 'bson-objectid';
import SelectList from './SelectList';
import { Formik } from 'formik';
import * as yup from 'yup';
import DeleteAddressModal from 'components/modals/DeleteAddress';
import { useMutation } from '@apollo/react-hooks';
import StepLayout from './StepLayout';
import { Mode } from './mode';
import DeletePaymentMethodModal from 'components/modals/DeletePaymentMethod';

export interface CheckoutPageProps extends PageProps {
  data: Record<string, unknown>;
}

interface CheckoutPageContentProps extends CheckoutPageProps {
  messages: CheckoutMessages;
}

const CheckoutPage = (args: CheckoutPageContentProps): JSX.Element => {
  const [addressModalIsOpen, setAddressModalIsOpen] = useState(false);
  const toggleAddressModal = () => setAddressModalIsOpen(!addressModalIsOpen);
  const [addPaymentModalIsOpen, setPaymentModalIsOpen] = useState(false);
  const togglePaymentModal = () =>
    setPaymentModalIsOpen(!addPaymentModalIsOpen);

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
    DeleteAddressMutation,
    DeleteAddressMutationVariables
  >(DeleteAddress);

  const language = getCurrentLanguage();
  const [mapsScriptLoading] = useScript({
    src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GATSBY_GOOGLE_PLACES_AUTOCOMPLETE_KEY}&libraries=places&language=${language}`,
    checkForExisting: true,
  });
  // add vs edit
  const [add, setAdd] = useState(true);

  const [addresses, setAddresses] = useState<
    ApolloQueryResult<AddressesQuery> | undefined
  >(undefined);

  const updateAddresses = async (): Promise<void> => {
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

  const updatePaymentMethods = async (): Promise<void> => {
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

  useEffect(() => {
    (async () => {
      await updateAddresses();
      await updatePaymentMethods();
    })();
  }, []);

  return (
    <>
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <Formik
          initialValues={{
            address: null,
            paymentMethod: null,
          }}
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
          {({ values, setFieldValue }) => (
            <Form>
              <Row>
                <Col md="7">
                  <h2 className="text-center">Checkout</h2>
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
                      />
                    </StepLayout>
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
                      />
                    </StepLayout>
                  </Container>
                </Col>
                <Col md="4">
                  <Summary messages={args.messages} />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Container>
      <DeleteAddressModal
        isOpen={deleteAddressModalIsOpen}
        toggle={toggleDeleteAddressModal}
        deleteAddress={async (): Promise<void> => {
          if (!addresses || !currentAddress) return;
          await deleteAddressMutation({
            variables: {
              id: currentAddress,
            },
            update: () => {
              setAddresses({
                ...addresses,
                loading: false,
                data: {
                  addresses: addresses.data.addresses.filter(
                    (elem) => !(elem._id as ObjectId).equals(currentAddress)
                  ),
                },
              });
            },
          });
        }}
      />
      <DeletePaymentMethodModal
        isOpen={deletePaymentModalIsOpen}
        toggle={toggleDeletePaymentModal}
        deletePaymentMethod={async (): Promise<void> => {
          if (!paymentMethods || !currentPaymentMethod) return;
          await deletePaymentMethodMutation({
            variables: {
              id: currentPaymentMethod,
            },
            update: () => {
              setPaymentMethods({
                ...paymentMethods,
                loading: false,
                data: {
                  paymentMethods: paymentMethods.data.paymentMethods.filter(
                    (elem) =>
                      !(elem._id as ObjectId).equals(currentPaymentMethod)
                  ),
                },
              });
            },
          });
        }}
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

export default CheckoutPage;
