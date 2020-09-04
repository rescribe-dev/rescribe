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

import 'react-dates/lib/css/_datepicker.css';
import CreatedTokenModal from '../modals/CreatedTokenModal';

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
    scopes: [],
    notes: '',
    hasExpiration: false,
    expires: null,
  };

  const [createTokenModalIsOpen, setCreateTokenModalIsOpen] = useState(false);

  return (
    <Container>
      <div>new token page</div>
      <Formik
        enableReinitialize={true}
        initialValues={initialFormValues}
        validationSchema={yup.object({
          scopes: yup.array().required('scopes are required'),
          notes: yup.string().required('notes are required'),
          hasExpiration: yup.bool(),
          expires: yup.number().when('hasExpiration', {
            is: true,
            then: yup.number().required('expiration date required'),
          }),
        })}
        onSubmit={async (
          formData,
          { setSubmitting, setStatus }
        ): Promise<void> => {
          try {
            // TODO - add more scopes with a selector
            formData.scopes = [
              {
                category: ScopeCategory.All,
                level: ScopeLevel.Write,
              },
            ];
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
            if (!createTokenRes.data || !createTokenRes.data.addToken.data) {
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
                onChange={() =>
                  setFieldValue('hasExpiration', !values.hasExpiration)
                }
              />
            </FormGroup>
            {values.hasExpiration ? (
              <>
                <FormGroup>
                  <Label for="expires">Expires</Label>
                  <SingleDatePicker
                    id="expires"
                    date={values.expires} // momentPropTypes.momentObj or null
                    onDateChange={(date) => setFieldValue('expires', date)} // PropTypes.func.isRequired
                    focused={expiresFocused} // PropTypes.bool
                    onFocusChange={({ focused }) => {
                      setExpiresFocused(focused ? focused : false);
                      if (focused) {
                        setFieldTouched('expires', true);
                      }
                    }}
                    // add locale: https://github.com/airbnb/react-dates#localization
                    disabled={isSubmitting}
                  />
                  <FormFeedback
                    style={{
                      marginBottom: '1rem',
                    }}
                    className="feedback"
                    type="invalid"
                  >
                    {touched.expires && errors.expires ? errors.expires : ''}
                  </FormFeedback>
                </FormGroup>
              </>
            ) : null}
            <Button
              type="submit"
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
      <CreatedTokenModal
        isOpen={createTokenModalIsOpen}
        toggle={() => {
          setCreateTokenModalIsOpen(false);
          navigate('/settings/tokens');
        }}
        token={token}
      />
    </Container>
  );
};

export default NewPage;
