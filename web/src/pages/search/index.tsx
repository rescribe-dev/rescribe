import React, { useState } from 'react';
import * as yup from 'yup';
import BeatLoader from 'react-spinners/BeatLoader';
import { css } from '@emotion/core';
import {
  Container,
  Form,
  Label,
  Input,
  FormFeedback,
  FormGroup,
  Button,
} from 'reactstrap';
import { PageProps } from 'gatsby';
import { Formik } from 'formik';

import './index.scss';

import SEO from '../../components/seo';
import ObjectId from 'bson-objectid';
import { toast } from 'react-toastify';
import {
  Search,
  SearchQuery,
  SearchQueryVariables,
} from '../../lib/generated/datamodel';
import { client } from '../../utils/apollo';
import Filters from '../../components/search/filters';
import { FileResultComponent } from '../../components/search/fileResult';
import Layout from '../../layouts';

const perpageOptions = [10, 20];

const defaultPerpage = perpageOptions[0];

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SearchPageDataType {}

const SearchPage = (args: PageProps<SearchPageDataType>) => {
  const [page] = useState<number>(0);
  const [perpage] = useState<number>(defaultPerpage);
  const [searchResult, setSearchResult] = useState<SearchQuery | undefined>(
    undefined
  );
  const [selectedProjects, setSelectedProjects] = useState<ObjectId[]>([]);
  const [selectedRepositories, setSelectedRepositories] = useState<ObjectId[]>(
    []
  );
  const [hasSearched, setHasSearched] = useState(false);
  let initialQuery = '';
  if (args.location.search.length > 0) {
    const searchParams = new URLSearchParams(args.location.search);
    if (searchParams.has('search')) {
      initialQuery = searchParams.get('token') as string;
    }
  }
  return (
    <Layout>
      <SEO title="Search" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <Filters
          onChangeProjects={setSelectedProjects}
          onChangeRepositories={setSelectedRepositories}
        />
        <Formik
          initialValues={{
            query: initialQuery,
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
                maxResultsPerFile: 1,
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
                fetchPolicy: 'no-cache', // disable cache
              });
              if (queryRes.errors) {
                toast(queryRes.errors.join(', '), {
                  type: 'error',
                });
                onError();
              } else {
                setHasSearched(true);
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
          }) => (
            <>
              <Form>
                <FormGroup>
                  <Label for="query">Search Term</Label>
                  <Input
                    id="query"
                    name="query"
                    type="text"
                    placeholder="search term"
                    style={{
                      marginBottom: '0.5rem',
                    }}
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
              {searchResult === undefined ||
              searchResult.search.length === 0 ? (
                <>
                  {hasSearched ? (
                    <p>no results found</p>
                  ) : (
                    <p>try searching for something</p>
                  )}
                </>
              ) : (
                <Container>
                  {searchResult.search.map((file) => {
                    const fileResults = [...file.results];
                    if (file.fileResult && file.fileResult.results.length > 0) {
                      const names = file.fileResult.results
                        .map((resultData) => resultData.name)
                        .join(', ');
                      const type = file.fileResult.results[0].type;
                      fileResults.unshift({
                        name: names,
                        type,
                        preview: file.fileResult.preview,
                      });
                    }
                    return (
                      <FileResultComponent
                        key={`file-${file._id}`}
                        file={file}
                        previewSearchResults={fileResults}
                      />
                    );
                  })}
                </Container>
              )}
            </>
          )}
        </Formik>
      </Container>
    </Layout>
  );
};

export default SearchPage;
