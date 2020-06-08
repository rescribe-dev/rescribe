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

import './index.scss';
import '../../assets/styles/global.scss';
import { css } from '@emotion/core';
import { toast } from 'react-toastify';
import { client } from '../../utils/apollo';
import {
  AddToMailingListMutation,
  AddToMailingListMutationVariables,
  AddToMailingList,
} from '../../lib/generated/datamodel';
import { nameMinLen } from '../../utils/variables';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Footer = () => {
  return (
    <footer>
      <Container>
        <p>Add to Email List:</p>
        <Formik
          initialValues={{
            name: '',
            email: '',
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .required('Name is required')
              .min(
                nameMinLen,
                `name must be at least ${nameMinLen} characters long`
              ),
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
                      setStatus({ success: true });
                      setSubmitting(false);
                      toast(`added ${formData.email} to mailing list`, {
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
                // console.error(err);
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
            <Form>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      autoComplete="name"
                      className='form-input'
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
                <Col>
                  <FormGroup>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="username"
                      className='form-input'
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
              </Row>
              <Button
                type="submit"
                onClick={(evt: React.MouseEvent) => {
                  evt.preventDefault();
                  handleSubmit();
                }}
              >
                Submit
              </Button>
              <BeatLoader
                css={loaderCSS}
                size={10}
                color={'red'}
                loading={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <p>© {new Date().getFullYear()}, Rescribe</p>
      </Container>
    </footer>
  );
};

export default Footer;
