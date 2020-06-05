import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import { css } from '@emotion/core';
import {
  Form,
  Label,
  Input,
  FormFeedback,
  FormGroup,
  Container,
  Button,
} from 'reactstrap';
import BeatLoader from 'react-spinners/BeatLoader';
import { PageProps, navigate } from 'gatsby';

import './index.scss';

import Layout from '../../layouts/index';
import SEO from '../../components/seo';
import { client } from '../../utils/apollo';
import { isLoggedIn } from '../../state/auth/getters';
import { useDispatch } from 'react-redux';
import { AuthActionTypes } from '../../state/auth/types';
import { AppThunkDispatch } from '../../state/thunk';
import { isSSR } from '../../utils/checkSSR';
import { thunkLogout } from '../../state/auth/thunks';
import {
  Register,
  RegisterMutation,
  RegisterMutationVariables,
} from '../../lib/generated/datamodel';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RegisterPageDataType extends PageProps {}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const RegisterPage = (args: RegisterPageDataType) => {
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
  }
  isLoggedIn()
    .then((loggedIn) => {
      if (loggedIn) {
        navigate('/account');
      }
    })
    .catch((_err) => {
      dispatchAuthThunk(thunkLogout());
    });
  return (
    <Layout location={args.location}>
      <SEO title="Login" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
          }}
          validationSchema={yup.object({
            email: yup
              .string()
              .email('invalid email address')
              .required('required'),
            password: yup.string().required('required'),
          })}
          onSubmit={(formData, { setSubmitting, setStatus }) => {
            if (!window.grecaptcha) {
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
                window.grecaptcha
                  .execute(process.env.GATSBY_RECAPTCHA_SITE_KEY, {
                    action: 'register',
                  })
                  .then(async (_recaptchaToken: string) => {
                    try {
                      const registerRes = await client.mutate<
                        RegisterMutation,
                        RegisterMutationVariables
                      >({
                        mutation: Register,
                        variables: formData,
                      });
                      if (registerRes.errors) {
                        throw new Error(registerRes.errors.join(', '));
                      }
                      navigate('/login');
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
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Name"
                  style={{
                    marginBottom: '0.5rem',
                  }}
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
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  style={{
                    marginBottom: '0.5rem',
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  invalid={!!(touched.email && errors.email)}
                  disabled={isSubmitting}
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
              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onKeyDown={(evt: React.KeyboardEvent) => {
                    if (evt.key === 'Enter') {
                      evt.preventDefault();
                      handleSubmit();
                    }
                  }}
                  style={{
                    marginBottom: '0.5rem',
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  invalid={!!(touched.password && errors.password)}
                  disabled={isSubmitting}
                />
                <FormFeedback
                  style={{
                    marginBottom: '1rem',
                  }}
                  className="feedback"
                  type="invalid"
                >
                  {touched.password && errors.password ? errors.password : ''}
                </FormFeedback>
              </FormGroup>
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
      </Container>
    </Layout>
  );
};

export default RegisterPage;
