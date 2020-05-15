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
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import ObjectId from 'bson-objectid';
import { toast } from 'react-toastify';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
  RepositoriesQuery,
  RepositoriesQueryVariables,
  Repositories,
} from '../../lib/generated/datamodel';
import { client } from '../../utils/apollo';
import AsyncSelect from 'react-select/async';

interface SelectObject {
  value: ObjectId;
  label: string;
}

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SearchPageDataType {}

const SearchPage = (_args: PageProps<SearchPageDataType>) => {
  const project = useSelector<RootState, ObjectId | null>((state) => {
    return state.projectReducer.id
      ? new ObjectId(state.projectReducer.id)
      : null;
  });
  if (!project) {
    return <div></div>;
  }
  const getRepositories = async (
    inputValue: string
  ): Promise<SelectObject[]> => {
    const repositoriesData = await client.query<
      RepositoriesQuery,
      RepositoriesQueryVariables
    >({
      query: Repositories,
      variables: {
        project,
      },
    });
    if (repositoriesData.data) {
      return repositoriesData.data.repositories
        .filter((repository) => {
          return repository.name
            .toLowerCase()
            .includes(inputValue.toLowerCase());
        })
        .map((repository) => {
          const newSelectItem: SelectObject = {
            label: repository.name,
            value: new ObjectId(repository._id),
          };
          return newSelectItem;
        });
    } else {
      throw new Error('cannot find projects data');
    }
  };
  const [searchResult, setSearchResult] = useState<FilesQuery | undefined>(
    undefined
  );
  const [selectedRepositories, setSelectedRepositories] = useState<
    SelectObject[]
  >([]);
  return (
    <>
      <SEO title="Project" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <div>{project.toHexString()}</div>
        <Formik
          initialValues={{
            query: '',
            repositories: [],
            branch: '',
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
              const queryRes = await client.query<
                FilesQuery,
                FilesQueryVariables
              >({
                query: Files,
                variables: {
                  query: formData.query,
                  project,
                },
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
            setFieldValue,
          }) => [
            <Form key="form">
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
              <FormGroup>
                <Label for="repository">Repository</Label>
                <AsyncSelect
                  id="repositories"
                  name="repositories"
                  isMulti
                  cacheOptions
                  defaultOptions
                  value={selectedRepositories}
                  onChange={(selectedOptions) => {
                    if (!selectedOptions) {
                      selectedOptions = [];
                    }
                    setSelectedRepositories(selectedOptions as SelectObject[]);
                    const repositories = selectedRepositories.map(
                      (repository) => repository.value
                    );
                    setFieldValue('repositories', repositories, true);
                  }}
                  onBlur={handleBlur}
                  loadOptions={getRepositories}
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
            </Form>,
            searchResult === undefined ||
            searchResult.files.length === 0 ? null : (
              <Container key="result">
                <p>{JSON.stringify(searchResult)}</p>
              </Container>
            ),
          ]}
        </Formik>
      </Container>
    </>
  );
};

export default SearchPage;
