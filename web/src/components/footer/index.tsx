import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BeatLoader from 'react-spinners/BeatLoader';
import {
  Button,
  Form,
  Label,
  Input,
  FormGroup,
  FormFeedback,
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
      onSubmit={(fields) => {
        alert('SUCCESS!! :-)\n\n' + JSON.stringify(fields, null, 4));
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
          <FormGroup>
            <Label for="email">Email</Label>
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
  );
};

export default Footer;
