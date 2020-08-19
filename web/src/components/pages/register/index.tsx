import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import { css } from '@emotion/core';
import {
  Form,
  Button,
  Label,
  Input,
  FormFeedback,
  FormGroup,
  Container,
  Row,
  Col,
} from 'reactstrap';
import BeatLoader from 'react-spinners/BeatLoader';
import { navigate, PageProps } from 'gatsby';

import { client } from 'utils/apollo';
import { isLoggedIn, getUsername } from 'state/auth/getters';
import { useDispatch } from 'react-redux';
import { AuthActionTypes } from 'state/auth/types';
import { AppThunkDispatch } from 'state/thunk';
import { isSSR } from 'utils/checkSSR';
import { thunkLogout } from 'state/auth/thunks';
import {
  Register,
  RegisterMutation,
  RegisterMutationVariables,
} from 'lib/generated/datamodel';
import {
  passwordMinLen,
  specialCharacterRegex,
  capitalLetterRegex,
  lowercaseLetterRegex,
  numberRegex,
} from 'shared/variables';
import SocialButtons from 'components/SocialButtons';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

import './index.scss';
import { RegisterMessages } from 'locale/pages/register/registerMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RegisterPageDataProps extends PageProps {}

interface RegisterProps extends RegisterPageDataProps {
  messages: RegisterMessages;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const RegisterPage = (args: RegisterProps): JSX.Element => {
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
  }
  isLoggedIn()
    .then((loggedIn) => {
      if (loggedIn) {
        const username = getUsername();
        if (username.length > 0) {
          navigate(`/${username}`);
        }
      }
    })
    .catch((_err) => {
      dispatchAuthThunk(thunkLogout());
    });
  return (
    <div id="fillPageContainer">
      <Container
        style={{
          marginTop: '4rem',
        }}
      >
        <Row className="justify-content-center h-100">
          <Col
            lg={{
              size: 4,
            }}
          >
            <h3
              style={{
                marginBottom: '1rem',
              }}
            >
              Sign Up
            </h3>
            <Formik
              initialValues={{
                username: '',
                email: '',
                password: '',
                confirmedPassword: '',
              }}
              validationSchema={yup.object({
                username: yup.string().required('required'),
                email: yup
                  .string()
                  .required('required')
                  .email('invalid email address'),
                password: yup
                  .string()
                  .required('required')
                  .min(
                    passwordMinLen,
                    `password must be at least ${passwordMinLen} characters long`
                  )
                  .matches(
                    lowercaseLetterRegex,
                    'password must contain at least one lowercase letter'
                  )
                  .matches(
                    capitalLetterRegex,
                    'password must contain at least one uppercase letter'
                  )
                  .matches(
                    numberRegex,
                    'password must contain at least one number'
                  )
                  .matches(
                    specialCharacterRegex,
                    'password must contain at least one special character'
                  ),
                confirmedPassword: yup.string().when('password', {
                  is: (val) => val && val.length > 0,
                  then: yup
                    .string()
                    .oneOf(
                      [yup.ref('password')],
                      'Both passwords need to be the same'
                    )
                    .required(),
                }), // https://github.com/jaredpalmer/formik/issues/90
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
                          const registerRes = await client.mutate<
                            RegisterMutation,
                            RegisterMutationVariables
                          >({
                            mutation: Register,
                            variables: {
                              ...formData,
                              name: formData.username,
                              recaptchaToken,
                            },
                          });
                          if (registerRes.errors) {
                            throw new Error(registerRes.errors.join(', '));
                          }
                          setStatus({ success: true });
                          setSubmitting(false);
                          toast('Check email for verification', {
                            type: 'success',
                          });
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
                <Form onSubmit={handleSubmit} className="underline-inputs">
                  <FormGroup>
                    <Label for="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Username"
                      className="form-input"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.username}
                      invalid={!!(touched.username && errors.username)}
                      disabled={isSubmitting}
                    />
                    <FormFeedback
                      style={{
                        marginBottom: '1rem',
                      }}
                      className="feedback"
                      type="invalid"
                    >
                      {touched.username && errors.username
                        ? errors.username
                        : ''}
                    </FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
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
                      placeholder="Password"
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
                      {touched.password && errors.password
                        ? errors.password
                        : ''}
                    </FormFeedback>
                  </FormGroup>
                  {values.password.length === 0 ? null : (
                    <>
                      <FormGroup>
                        <Label for="confirmedPassword">Confirm Password</Label>
                        <Input
                          id="confirmedPassword"
                          name="confirmedPassword"
                          type="password"
                          placeholder="Confirm Password"
                          onKeyDown={(evt: React.KeyboardEvent) => {
                            if (evt.key === 'Enter') {
                              evt.preventDefault();
                              handleSubmit();
                            }
                          }}
                          className="form-input"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.confirmedPassword}
                          invalid={
                            !!(
                              touched.confirmedPassword &&
                              errors.confirmedPassword
                            )
                          }
                          disabled={isSubmitting}
                        />
                        <FormFeedback
                          style={{
                            marginBottom: '1rem',
                          }}
                          className="feedback"
                          type="invalid"
                        >
                          {touched.confirmedPassword && errors.confirmedPassword
                            ? errors.confirmedPassword
                            : ''}
                        </FormFeedback>
                      </FormGroup>
                    </>
                  )}
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
                </Form>
              )}
            </Formik>
            <hr />
            <SocialButtons location={args.location} signUp={true} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;
