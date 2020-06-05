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
import { css } from '@emotion/core';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Footer = () => {
  return (
    <Container>
      <p>Add to Email List:</p>
      <Formik
        initialValues={{
          name: '',
          email: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .email('Email is invalid')
            .required('Email is required'),
        })}
        onSubmit={(formData, { setSubmitting, setStatus }) => {
          setSubmitting(true);
          setStatus({ success: true });
          console.log(formData);
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
              </Col>
              <Col>
                <FormGroup>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    style={{
                      marginBottom: '0.5rem',
                    }}
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
    </Container>
  );
};

export default Footer;
