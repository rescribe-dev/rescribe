import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  Container,
} from 'reactstrap';
import * as yup from 'yup';

import './index.scss';
import { Formik, FormikValues } from 'formik';
import { defaultCountry as defaultCountryCode } from 'shared/variables';
import { css } from '@emotion/core';
import { countries, Country } from 'countries-list';

import BeatLoader from 'react-spinners/BeatLoader';
import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { propertyOf } from 'utils/misc';
import { client } from 'utils/apollo';
import { toast } from 'react-toastify';
import {
  CountriesQuery,
  CountriesQueryVariables,
  Countries,
  AddAddressMutation,
  AddAddressMutationVariables,
  AddAddress,
} from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';
import { UpdateMethod } from 'components/pages/checkout/misc';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

interface SelectCountryObject {
  value: string;
  code: string;
  label: JSX.Element;
}

interface SelectAddressObject {
  value: string;
  label: JSX.Element;
}

interface WriteAddressArgs {
  add: boolean;
  isOpen: boolean;
  toggle: () => void;
  updateAddresses: UpdateMethod;
}

// TODO - add address editing
const WriteAddress = (args: WriteAddressArgs): JSX.Element => {
  const [selectedCountry, setSelectedCountry] = useState<
    SelectCountryObject | undefined
  >(undefined);
  const [defaultCountryOptions, setDefaultCountryOptions] = useState<
    SelectCountryObject[]
  >([]);
  const [defaultCountry, setDefaultCountry] = useState<
    SelectCountryObject | undefined
  >(undefined);

  const getCountryLabel = (country: Country): JSX.Element => {
    return (
      <Container>
        <Row>
          <Col xs="auto">{country.emoji}</Col>
          <Col xs="auto">{country.name}</Col>
        </Row>
      </Container>
    );
  };

  const [selectedAddress, setSelectedAddress] = useState<
    SelectAddressObject | undefined
  >(undefined);

  const getCountryOptions = async (
    inputValue: string
  ): Promise<SelectCountryObject[]> => {
    const countryRes = await client.query<
      CountriesQuery,
      CountriesQueryVariables
    >({
      query: Countries,
      variables: {},
      fetchPolicy: 'cache-first', // disable cache
    });
    if (countryRes.data) {
      const countryData: Record<string, Country> = {};
      for (const countryCode of countryRes.data.countries) {
        countryData[countryCode] =
          countries[propertyOf<typeof countries>(countryCode)];
      }
      const filteredCountries =
        inputValue.length === 0
          ? countryRes.data.countries
          : countryRes.data.countries.filter((countryCode) => {
              const currentCountry = countryData[countryCode];
              return currentCountry.name
                .toLowerCase()
                .includes(inputValue.toLowerCase());
            });
      const countryOptions = filteredCountries.map((countryCode) => {
        const currentCountry = countryData[countryCode];
        const newSelectItem: SelectCountryObject = {
          label: getCountryLabel(currentCountry),
          code: countryCode.toLowerCase(),
          value: currentCountry.name,
        };
        return newSelectItem;
      });
      if (defaultCountryOptions.length === 0) {
        setDefaultCountryOptions(countryOptions);
      }
      return countryOptions;
    } else {
      throw new Error('cannot find country data');
    }
  };

  const [addressAutocomplete, setAddressAutocomplete] = useState<
    google.maps.places.AutocompleteService | undefined
  >(undefined);
  const { google } = window;

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const newCountryOptions = await getCountryOptions('');
        const defaultCountryCodeLowerCase = defaultCountryCode.toLowerCase();
        const newDefaultCountry = newCountryOptions.find(
          (country) => country.code === defaultCountryCodeLowerCase
        );
        setDefaultCountry(newDefaultCountry);
        setSelectedCountry(newDefaultCountry);
        if (!google || !google.maps.places) {
          throw new Error('cannot find autocomplete service');
        }
        const autocompleteClient = new google.maps.places.AutocompleteService();
        setAddressAutocomplete(autocompleteClient);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);

  const getAddressOptions = async (
    inputValue: string
  ): Promise<SelectAddressObject[]> => {
    if (!addressAutocomplete) {
      throw new Error('autocomplete not initialized');
    }
    return new Promise((resolve, reject) => {
      addressAutocomplete.getPlacePredictions(
        {
          input: inputValue,
          types: [],
          componentRestrictions: {
            country: selectedCountry ? selectedCountry.code : '',
          },
        },
        (res, status) => {
          try {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
              throw new Error('problem getting autocomplete data');
            }
            resolve(
              res.map((suggestion) => {
                const {
                  main_text,
                  secondary_text,
                } = suggestion.structured_formatting;
                return {
                  label: (
                    <>
                      <strong>{main_text}</strong>{' '}
                      <small>{secondary_text}</small>
                    </>
                  ),
                  value: suggestion.place_id,
                };
              })
            );
          } catch (err) {
            reject(err as Error);
          }
        }
      );
    });
  };

  const formRef = useRef<FormikValues>();

  return (
    <Modal
      onClosed={() => {
        setSelectedCountry(defaultCountry);
        setSelectedAddress(undefined);
        if (formRef.current) {
          formRef.current.resetForm();
        }
      }}
      isOpen={args.isOpen}
      toggle={args.toggle}
    >
      <ModalHeader toggle={args.toggle}>
        {args.add ? 'Add' : 'Edit'} Address
      </ModalHeader>
      <Formik
        innerRef={(formRef as unknown) as (instance: any) => void}
        enableReinitialize={true}
        initialValues={{
          name: '',
          country: defaultCountry ? defaultCountry.code : '',
          address: '',
        }}
        validationSchema={yup.object({
          country: yup.string().required('required'),
          name: yup.string().required('required'),
          address: yup.string().required('required'),
        })}
        onSubmit={async (
          formData,
          { setSubmitting, setStatus }
        ): Promise<void> => {
          try {
            const addAddressRes = await client.mutate<
              AddAddressMutation,
              AddAddressMutationVariables
            >({
              mutation: AddAddress,
              variables: {
                name: formData.name,
                place_id: formData.address,
              },
            });
            if (addAddressRes.errors) {
              throw new Error(addAddressRes.errors.join(', '));
            }
            if (!addAddressRes.data || !addAddressRes.data.addAddress._id) {
              throw new Error(
                'cannot get id for address that was just created'
              );
            }
            const addressID = new ObjectId(addAddressRes.data.addAddress._id);
            await args.updateAddresses({
              id: addressID,
            });
            setSelectedAddress(undefined);
            setSelectedCountry(undefined);
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
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setTouched,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="form-input"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  invalid={!!(touched.name && errors.name)}
                  disabled={isSubmitting}
                />
                <FormFeedback
                  style={{
                    marginBottom: '1rem',
                  }}
                  className="feedback"
                  type="invalid"
                >
                  {touched.name && errors.name ? errors.name : ''}
                </FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="country">Country</Label>
                <AsyncSelect
                  id="country"
                  name="country"
                  isMulti={false}
                  defaultOptions={defaultCountryOptions}
                  cacheOptions={true}
                  loadOptions={getCountryOptions}
                  value={selectedCountry}
                  onChange={(
                    selectedOption: ValueType<SelectCountryObject>
                  ) => {
                    if (!selectedOption) {
                      return;
                    }
                    const selected = selectedOption as SelectCountryObject;
                    setSelectedCountry(selected);
                    setFieldValue('country', selected.code);
                  }}
                  onBlur={(evt) => {
                    handleBlur(evt);
                    setTouched({
                      ...touched,
                      country: true,
                    });
                  }}
                  className={
                    touched.country && errors.country ? 'is-invalid' : ''
                  }
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      borderColor:
                        touched.country && errors.country
                          ? 'var(--red-stop)'
                          : styles.borderColor,
                    }),
                  }}
                  invalid={!!(touched.country && errors.country)}
                  disabled={isSubmitting}
                />
                <FormFeedback
                  style={{
                    marginBottom: '1rem',
                  }}
                  className="feedback"
                  type="invalid"
                >
                  {touched.country && errors.country ? errors.country : ''}
                </FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="address">Address</Label>
                <AsyncSelect
                  id="address"
                  name="address"
                  isMulti={false}
                  cacheOptions={false}
                  loadOptions={getAddressOptions}
                  value={selectedAddress}
                  onChange={(
                    selectedOption: ValueType<SelectAddressObject>
                  ) => {
                    if (!selectedOption) {
                      return;
                    }
                    const selected = selectedOption as SelectAddressObject;
                    setSelectedAddress(selected);
                    setFieldValue('address', selected.value);
                  }}
                  onBlur={(evt) => {
                    handleBlur(evt);
                    setTouched({
                      ...touched,
                      address: true,
                    });
                  }}
                  className={
                    touched.address && errors.address ? 'is-invalid' : ''
                  }
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      borderColor:
                        touched.address && errors.address
                          ? 'var(--red-stop)'
                          : styles.borderColor,
                    }),
                  }}
                  invalid={!!(touched.address && errors.address)}
                  disabled={isSubmitting || !values.country}
                />
                <FormFeedback
                  style={{
                    marginBottom: '1rem',
                  }}
                  className="feedback"
                  type="invalid"
                >
                  {touched.name && errors.name ? errors.name : ''}
                </FormFeedback>
              </FormGroup>
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
                disabled={isSubmitting}
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

export default WriteAddress;
