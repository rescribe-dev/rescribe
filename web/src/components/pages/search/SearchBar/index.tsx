import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormGroup, Input, FormFeedback, Button } from 'reactstrap';
import { navigate } from 'gatsby';
import { getSearchURL, getQuery } from 'state/search/getters';
import { useDispatch } from 'react-redux';
import { isSSR } from 'utils/checkSSR';
import { Dispatch } from 'redux';
import { setQuery } from 'state/search/actions';
import sleep from 'shared/sleep';
import { AppThunkDispatch } from 'state/thunk';
import { SearchActionTypes } from 'state/search/types';
import { thunkSearch } from 'state/search/thunks';

const SearchBar = (): JSX.Element => {
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  if (!isSSR) {
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
  }

  return (
    <Formik
      initialValues={{
        query: getQuery(),
      }}
      validationSchema={yup.object({
        query: yup.string().required('required'),
      })}
      onSubmit={async (formData, { setSubmitting, setStatus }) => {
        setSubmitting(true);
        dispatch(setQuery(formData.query));
        await navigate(getSearchURL());
        // TODO - fix this
        // hack to allow for react state to update before search
        await sleep(50);
        try {
          await dispatchSearchThunk(thunkSearch());
        } catch (err) {
          setStatus({ success: false });
          toast(err.message, {
            type: 'error',
          });
        }
        setSubmitting(false);
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
            }}
          >
            <FormGroup
              style={{
                margin: 0,
                width: '100%',
                marginRight: '1rem',
              }}
            >
              <Input
                style={{
                  borderColor: '#CCCCCC',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  borderRadius: '0.25rem',
                  width: '100%',
                }}
                id="query"
                name="query"
                type="text"
                placeholder="search for"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.query}
                invalid={!!(touched.query && errors.query)}
                disabled={isSubmitting}
              />
              <FormFeedback
                style={{
                  marginBottom: '1rem',
                }}
                type="invalid"
              >
                {touched.query && errors.query ? errors.query : ''}
              </FormFeedback>
            </FormGroup>
            <Button
              style={{
                color: '#fff',
                backgroundColor: 'var(--pastel-red)',
                borderColor: 'var(--pastel-red)',
                fontSize: '0.9em',
                fontWeight: 600,
                borderRadius: '0.25rem',
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
