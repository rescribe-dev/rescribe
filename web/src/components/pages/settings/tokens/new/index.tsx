import React, { useState } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button,
  CustomInput,
  CardBody,
  Card,
  Row,
  Col,
} from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';
import { NewMessages } from 'locale/pages/settings/tokens/new/newMessages';
import { Formik } from 'formik';
import {
  ScopeInput,
  AddTokenMutation,
  AddTokenMutationVariables,
  AddToken,
  ScopeCategory,
  ScopeLevel,
} from 'lib/generated/datamodel';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { client } from 'utils/apollo';
import { navigate } from '@reach/router';
import { SingleDatePicker } from 'react-dates';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import CreatedTokenModal from '../modals/CreatedTokenModal';
import sleep from 'shared/sleep';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NewPageDataProps extends PageProps {}

interface NewProps extends NewPageDataProps {
  messages: NewMessages;
}

interface FormValuesType {
  scopes: ScopeInput[];
  notes: string;
  hasExpiration: boolean;
  expires: moment.Moment | null;
}

const NewPage = (_args: NewProps): JSX.Element => {
  const [expiresFocused, setExpiresFocused] = useState(false);
  const [token, setToken] = useState('');
  const initialFormValues: FormValuesType = {
    scopes: [
      {
        category: ScopeCategory.All,
        level: ScopeLevel.Write,
      },
    ],
    notes: '',
    hasExpiration: false,
    expires: null,
  };

  const [createTokenModalIsOpen, setCreateTokenModalIsOpen] = useState(false);

  return (
    <>
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <Row className="justify-content-center">
          <Col
            lg={{
              size: 4,
            }}
          >
            <Card>
              <CardBody>
                <h3
                  style={{
                    marginBottom: '1rem',
                  }}
                >
                  New Token
                </h3>
                <Formik
                  enableReinitialize={true}
                  initialValues={initialFormValues}
                  validationSchema={yup.object({
                    scopes: yup.array().required('scopes are required'),
                    notes: yup.string().required('notes are required'),
                    hasExpiration: yup.bool(),
                    expires: yup.mixed().when('hasExpiration', {
                      is: true,
                      then: yup.mixed().required('date is required'),
                    }),
                  })}
                  onSubmit={async (
                    formData,
                    { setSubmitting, setStatus }
                  ): Promise<void> => {
                    try {
                      // TODO - add more scopes with a selector
                      let expires: number;
                      if (formData.hasExpiration && formData.expires) {
                        expires = formData.expires.toDate().getTime();
                      } else {
                        expires = Number.MAX_SAFE_INTEGER;
                      }
                      const createTokenRes = await client.mutate<
                        AddTokenMutation,
                        AddTokenMutationVariables
                      >({
                        mutation: AddToken,
                        variables: {
                          notes: formData.notes,
                          scopes: formData.scopes,
                          expires,
                        },
                      });
                      if (createTokenRes.errors) {
                        throw new Error(createTokenRes.errors.join(', '));
                      }
                      if (
                        !createTokenRes.data ||
                        !createTokenRes.data.addToken.data
                      ) {
                        throw new Error('no token found');
                      }
                      setToken(createTokenRes.data.addToken.data);
                      setStatus({ success: true });
                      setSubmitting(false);
                      setCreateTokenModalIsOpen(true);
                    } catch (err) {
                      const errObject = err as Error;
                      toast(errObject.message, {
                        type: 'error',
                      });
                      setStatus({ success: false });
                      setSubmitting(false);
                    }
                  }}
                >
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                    setFieldValue,
                    setFieldTouched,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <FormGroup>
                        <Label for="notes">Notes</Label>
                        <Input
                          id="notes"
                          name="notes"
                          type="text"
                          placeholder="short description"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.notes}
                          invalid={!!(touched.notes && errors.notes)}
                          disabled={isSubmitting}
                        />
                        <FormFeedback type="invalid">
                          {touched.notes && errors.notes ? errors.notes : ''}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <CustomInput
                          style={{
                            display: 'inline',
                          }}
                          type="switch"
                          id="hasExpiration"
                          name="hasExpiration"
                          onChange={() => {
                            if (!values.hasExpiration) {
                              setFieldValue('expires', null);
                            }
                            setFieldValue(
                              'hasExpiration',
                              !values.hasExpiration
                            );
                          }}
                        />
                      </FormGroup>
                      {values.hasExpiration ? (
                        <>
                          <FormGroup>
                            <Label for="expires">Expires</Label>
                            <div>
                              {/* maybe use material picker instead: https://codesandbox.io/s/z9k3z?file=/demo.js */}
                              {/* this would allow you to enter a time also */}
                              <SingleDatePicker
                                id="expires"
                                date={values.expires} // momentPropTypes.momentObj or null
                                onDateChange={(date) =>
                                  setFieldValue('expires', date)
                                } // PropTypes.func.isRequired
                                focused={expiresFocused} // PropTypes.bool
                                onFocusChange={async ({ focused }) => {
                                  setExpiresFocused(focused ? focused : false);
                                  if (!focused) {
                                    // wait for time before updating field
                                    await sleep(50);
                                    setFieldTouched('expires', true);
                                  }
                                }}
                                // add locale: https://github.com/airbnb/react-dates#localization
                                disabled={isSubmitting}
                              />
                            </div>
                            <div
                              style={{
                                color: 'var(--red-stop)',
                                fontSize: '12.8px',
                              }}
                            >
                              {touched.expires && errors.expires
                                ? errors.expires
                                : ''}
                            </div>
                          </FormGroup>
                        </>
                      ) : null}
                      <Button
                        type="submit"
                        color="secondary"
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
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <CreatedTokenModal
        isOpen={createTokenModalIsOpen}
        toggle={() => {
          setCreateTokenModalIsOpen(false);
          navigate('/settings/tokens');
        }}
        token={token}
      />
    </>
  );
};

export default NewPage;
