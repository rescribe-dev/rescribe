import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  SearchQueryVariables,
  SearchQuery,
  Search,
} from '../../../lib/generated/datamodel';
import { client } from '../../../utils/apollo';
import { ObjectId } from 'mongodb';
import { toast } from 'react-toastify';
import { FormGroup, Input, FormFeedback, Button, Container } from 'reactstrap';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';

const perpageOptions = [5, 10];

const defaultPerpage = perpageOptions[0];

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

export default function SearchBar() {
  const [page] = useState<number>(0);
  const [perpage] = useState<number>(defaultPerpage);
  const [searchResult, setSearchResult] = useState<SearchQuery | undefined>(
    undefined
  );
  const [selectedProjects] = useState<ObjectId[]>([]);
  const [selectedRepositories] = useState<ObjectId[]>([]);
  //   const placeholder = props.placeholder ? props.placeholder : 'Insert text.';
  //   const callback = props.callback;
  //   const id = props.id ? props.id : Math.floor(Math.random() * 10000).toString();
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
          console.log(formData);
          const variables: SearchQueryVariables = {
            query: formData.query,
            page,
            perpage,
          };
          if (selectedProjects.length > 0) {
            if (selectedRepositories.length > 0) {
              variables.repositories = selectedRepositories;
            } else {
              variables.projects = selectedProjects;
            }
          }
          const queryRes = await client.query<
            SearchQuery,
            SearchQueryVariables
          >({
            query: Search,
            variables,
          });
          if (queryRes.errors) {
            toast(queryRes.errors.join(', '), {
              type: 'error',
            });
            onError();
          } else {
            setStatus({ success: true });
            setSearchResult(queryRes.data);
            setSubmitting(false);
          }
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
      }) => [
        <Form key="form" className="search-bar-wrapper">
          <FormGroup>
            <Input
              className="search-text-field"
              id="query"
              name="query"
              type="text"
              placeholder="search term"
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
              className="feedback"
              type="invalid"
            >
              {touched.query && errors.query ? errors.query : ''}
            </FormFeedback>
          </FormGroup>
          <Button
            className="search-button"
            type="submit"
            onClick={(evt: React.MouseEvent) => {
              evt.preventDefault();
              handleSubmit();
            }}
          >
            Go
          </Button>
          <BeatLoader
            css={loaderCSS}
            size={10}
            color={'red'}
            loading={isSubmitting}
          />
        </Form>,
        searchResult === undefined ||
        searchResult.search.length === 0 ? null : (
          <Container key="result">
            <p>{JSON.stringify(searchResult)}</p>
          </Container>
        ),
      ]}
    </Formik>
  );
}

SearchBar.propTypes = {
  // callback: PropTypes.func.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
};
