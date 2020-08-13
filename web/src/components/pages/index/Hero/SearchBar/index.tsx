import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormGroup, Input, FormFeedback, Button } from 'reactstrap';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import { navigate } from 'gatsby';
import { getSearchURL } from 'state/search/getters';
import { useDispatch } from 'react-redux';
import { isSSR } from 'utils/checkSSR';
import { Dispatch } from 'redux';
import { setQuery } from 'state/search/actions';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const SearchBar = (): JSX.Element => {
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  return (
    <Formik
      initialValues={{
        query: '',
      }}
      validationSchema={yup.object({
        query: yup.string().required('required'),
      })}
      onSubmit={async (formData, { setSubmitting, setStatus }) => {
        setSubmitting(true);
        const onError = (): void => {
          setStatus({ success: false });
          setSubmitting(false);
        };
        try {
          dispatch(setQuery(formData.query));
          navigate(getSearchURL());
        } catch (err) {
          toast(err.message, {
            type: 'error',
          });
          onError();
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
        isSubmitting,
      }) => (
        <>
          <Form
            style={{
              display: 'flex',
              width: '100%',
              marginBottom: '1rem',
            }}
          >
            <FormGroup
              style={{
                margin: 0,
                width: '100%',
                marginRight: 0,
              }}
            >
              <Input
                style={{
                  borderColor: '#CCCCCC',
                  fontSize: '0.9em',
                  fontWeight: 'lighter',
                  borderRadius: '0.25rem',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  width: '100%',
                }}
                id="query"
                name="query"
                type="text"
                placeholder="Search for"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.query}
                invalid={!!(touched.query && errors.query)}
                disabled={isSubmitting}
              />
              <FormFeedback
                style={{
                  marginBottom: '1rem',
                  color: 'white',
                }}
                type="invalid"
              >
                {touched.query && errors.query ? errors.query : ''}
              </FormFeedback>
            </FormGroup>
            <Button
              style={{
                color: '#ffffff',
                backgroundColor: 'var(--pastel-red)',
                borderColor: 'var(--pastel-red)',
                fontSize: '0.9em',
                fontWeight: 600,
                borderRadius: '0.25rem',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                minWidth: '80px',
                height: 'calc(1.5em + 0.75rem + 2px)',
              }}
              type="submit"
              onClick={(evt: React.MouseEvent) => {
                evt.preventDefault();
                handleSubmit();
              }}
              disabled={isSubmitting}
            >
              Go
            </Button>
            <BeatLoader
              css={loaderCSS}
              size={10}
              color="red"
              loading={isSubmitting}
            />
          </Form>
        </>
      )}
    </Formik>
  );
};

SearchBar.propTypes = {
  // callback: PropTypes.func.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SearchBar;
