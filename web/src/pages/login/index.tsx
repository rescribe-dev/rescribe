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
import { initializeApolloClient } from '../../utils/apollo';
import { isLoggedIn, getUsername } from '../../state/auth/getters';
import { thunkLogin, thunkLogout, thunkGetUser } from '../../state/auth/thunks';
import { useDispatch } from 'react-redux';
import { AuthActionTypes } from '../../state/auth/types';
import { AppThunkDispatch } from '../../state/thunk';
import { setToken } from '../../state/auth/actions';
import { isSSR } from '../../utils/checkSSR';
import { Dispatch } from 'redux';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoginPageDataType extends PageProps {}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const LoginPage = (args: LoginPageDataType) => {
  let token: string | undefined;
  let redirect: string | undefined;
  let cliLogin = false;
  let vscodeLogin = false;
  if (args.location.search.length > 0) {
    const searchParams = new URLSearchParams(args.location.search);
    if (searchParams.has('token')) {
      token = searchParams.get('token') as string;
    }
    if (searchParams.has('redirect')) {
      redirect = searchParams.get('redirect') as string;
    }
    if (searchParams.has('cli')) {
      cliLogin = true;
    } else if (searchParams.has('vscode')) {
      vscodeLogin = true;
    }
  }
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    dispatch = useDispatch();
  }
  isLoggedIn()
    .then(async (loggedIn) => {
      if (token === undefined && loggedIn) {
        const username = getUsername();
        if (username.length > 0) {
          if (redirect !== undefined) {
            navigate(redirect);
          } else {
            navigate(`/${username}`);
          }
        }
      }
    })
    .catch((_err) => {
      dispatchAuthThunk(thunkLogout());
    });
  return (
    <Layout location={args.location}>
      <SEO title="Login" />
      <Container className="default-container">
        <Formik
          initialValues={{
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
                    action: 'login',
                  })
                  .then(async (recaptchaToken: string) => {
                    if (token !== undefined) {
                      dispatch(setToken(token));
                      await initializeApolloClient();
                    }
                    try {
                      await dispatchAuthThunk(
                        thunkLogin({
                          ...formData,
                          recaptchaToken,
                        })
                      );
                      await initializeApolloClient();
                      await dispatchAuthThunk(thunkGetUser());
                      if (redirect !== undefined) {
                        navigate(redirect);
                      } else {
                        if (cliLogin) {
                          toast('view cli', {
                            type: 'success',
                          });
                        } else if (vscodeLogin) {
                          toast('view vscode', {
                            type: 'success',
                          });
                        }
                        const username = getUsername();
                        if (username.length > 0) {
                          navigate(`/${username}`);
                        }
                      }
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
                <Label for="email">Email</Label>
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
                  autoComplete="current-password"
                  placeholder="Password"
                  onKeyDown={(evt: React.KeyboardEvent) => {
                    if (evt.key === 'Enter') {
                      evt.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="form-input"
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
                disabled={isSubmitting}
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

export default LoginPage;
