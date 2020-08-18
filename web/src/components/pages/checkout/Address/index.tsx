import React, { useState, useEffect } from 'react';
import './index.scss';
import { CheckoutMessages } from 'locale/pages/checkout/checkoutMessages';
import WriteAddress from 'components/modals/WriteAddress';
import { client } from 'utils/apollo';
import { ApolloQueryResult } from 'apollo-client';
import {
  AddressesQuery,
  AddressesQueryVariables,
  Addresses,
} from 'lib/generated/datamodel';
import { toast } from 'react-toastify';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import ObjectId from 'bson-objectid';
import getCurrentLanguage from 'utils/language';
import useScript from 'react-script-hook';

interface AddressArgs {
  messages: CheckoutMessages;
}

const Address = (_args: AddressArgs): JSX.Element => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => setModalIsOpen(!modalIsOpen);

  const [addresses, setAddresses] = useState<
    ApolloQueryResult<AddressesQuery> | undefined
  >(undefined);

  // add vs edit
  const [addAddress, setAddAddress] = useState(true);

  const language = getCurrentLanguage();

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
      setAddresses(addressesRes);
    } catch (err) {
      const errObj = err as Error;
      toast(errObj.message, {
        type: 'error',
      });
    }
  };

  useEffect(() => {
    (async () => {
      await updateAddresses();
    })();
  });

  useScript({
    src: `https://maps.googleapis.com/maps/api/js?key=${process.env.GATSBY_GOOGLE_PLACES_AUTOCOMPLETE_KEY}&libraries=places&language=${language}`,
    checkForExisting: true,
  });

  return (
    <>
      {addresses === undefined || addresses.loading ? (
        <p>loading</p>
      ) : (
        <>
          {addresses.data.addresses.length === 0 ? (
            <Button
              onClick={(evt) => {
                evt.preventDefault();
                setAddAddress(true);
                toggleModal();
              }}
            >
              New Address
            </Button>
          ) : (
            <ListGroup>
              {addresses.data.addresses.map((address) => (
                <ListGroupItem
                  key={`address-${(address._id as ObjectId).toHexString()}`}
                >
                  {address.name}
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
          <WriteAddress
            add={addAddress}
            isOpen={modalIsOpen}
            toggle={toggleModal}
            updateAddresses={updateAddresses}
          />
        </>
      )}
    </>
  );
};

export default Address;
