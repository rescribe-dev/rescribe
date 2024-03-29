import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BeatLoader from 'react-spinners/BeatLoader';
import {
  Button,
  Form,
  Input,
  FormGroup,
  FormFeedback,
  Row,
  Col,
  Container,
} from 'reactstrap';

import { css } from '@emotion/core';
import { toast } from 'react-toastify';
import { client } from 'utils/apollo';
import {
  AddToMailingListMutation,
  AddToMailingListMutationVariables,
  AddToMailingList,
} from 'lib/generated/datamodel';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const Newsletter = (): JSX.Element => {
  return (
    <Container
      fluid
      style={{
        backgroundColor: 'var(--dark-blue)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          color: 'white',
          textAlign: 'center',
        }}
      >
        <p>
          Sign up for our newsletter.
          <br />
          Stay up to date on the latest rescribe developments.
        </p>
      </div>
      <Container>
        <Formik
          initialValues={{
            name: '',
            email: '',
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            email: Yup.string()
              .required('Email is required')
              .email('Email is invalid'),
          })}
          onSubmit={(formData, { setSubmitting, setStatus }) => {
            if (!window || !window.grecaptcha) {
              toast('cannot find recaptcha', {
                type: 'error',
              });
              return;
            }
            window.grecaptcha.ready(() => {
              const onError = () => {
                setStatus({ success: false });
                setSubmitting(false);
              };
              try {
                if (!process.env.GATSBY_RECAPTCHA_SITE_KEY) {
                  throw new Error('cannot find recaptcha token');
                }
                window.grecaptcha
                  .execute(process.env.GATSBY_RECAPTCHA_SITE_KEY, {
                    action: 'register',
                  })
                  .then(async (recaptchaToken: string) => {
                    try {
                      const addToMailingListRes = await client.mutate<
                        AddToMailingListMutation,
                        AddToMailingListMutationVariables
                      >({
                        mutation: AddToMailingList,
                        variables: {
                          ...formData,
                          recaptchaToken,
                        },
                      });
                      if (addToMailingListRes.errors) {
                        throw new Error(addToMailingListRes.errors.join(', '));
                      }
                      const message = addToMailingListRes.data
                        ? addToMailingListRes.data.addToMailingList
                        : `added ${formData.email} to mailing list`;
                      setStatus({ success: true });
                      setSubmitting(false);
                      toast(message, {
                        type: 'success',
                      });
                    } catch (err) {
                      toast(err.message, {
                        type: 'error',
                      });
                      onError();
                    }
                  })
                  .catch((err: Error) => {
                    toast(err.message, {
                      type: 'error',
                    });
                    onError();
                  });
              } catch (err) {
                // ignore the error
              }
            });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Row className="justify-content-center">
                <Col md="4">
                  <FormGroup>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      autoComplete="name"
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
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="username"
                      className="form-input"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      invalid={!!(touched.email && errors.email)}
                      disabled={isSubmitting}
                      onKeyDown={(evt: React.KeyboardEvent) => {
                        if (evt.key === 'Enter') {
                          evt.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    <FormFeedback
                      style={{
                        marginBottom: '1rem',
                      }}
                      className="feedback"
                      type="invalid"
                    >
                      {touched.email && errors.email ? errors.email : ''}
                    </FormFeedback>
                  </FormGroup>
                </Col>
                <Col sm={1}>
                  <Button
                    type="submit"
                    style={{
                      color: '#ffffff',
                      backgroundColor: 'var(--pastel-red)',
                      borderColor: 'var(--pastel-red)',
                    }}
                    onClick={(evt: React.MouseEvent) => {
                      evt.preventDefault();
                      handleSubmit();
                    }}
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
              <BeatLoader
                css={loaderCSS}
                size={10}
                color="var(--red-stop)"
                loading={isSubmitting}
              />
            </Form>
          )}
        </Formik>
      </Container>
    </Container>
  );
};

export default Newsletter;
