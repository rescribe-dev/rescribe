import React, { useState } from 'react';
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
  Card,
  CardBody,
} from 'reactstrap';
import BeatLoader from 'react-spinners/BeatLoader';
import { PageProps, navigate } from 'gatsby';

import './index.scss';

import Layout from '../../layouts/index';
import SEO from '../../components/seo';
import {
  validProjectName,
  validRepositoryName,
  perpageFilters,
  blacklistedRepositoryNames,
} from '../../utils/variables';
import PrivateRoute from '../../components/privateRoute';
import ObjectID from 'bson-objectid';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { ValueType } from 'react-select';
import { isSSR } from '../../utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import {
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
  AddProjectMutation,
  AddProjectMutationVariables,
  AddProject,
  AddRepositoryMutation,
  AddRepositoryMutationVariables,
  AddRepository,
  AccessLevel,
  RepositoryNameExistsQuery,
  RepositoryNameExistsQueryVariables,
  RepositoryNameExists,
  ProjectNameExistsQuery,
  ProjectNameExistsQueryVariables,
  ProjectNameExists,
} from '../../lib/generated/datamodel';
import { client } from '../../utils/apollo';

const loaderCSS = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

interface SelectTypeObject {
  value: string;
  label: string;
}

interface SelectPublicAccessObject {
  value: AccessLevel;
  label: string;
}

interface SelectOwnerObject {
  value: string;
  label: string;
}

interface SelectProjectObject {
  value: ObjectID;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NewPageDataType extends PageProps {}

const NewPage = (args: NewPageDataType) => {
  const projectType: SelectTypeObject = {
    value: 'project',
    label: 'Project',
  };
  const repositoryType: SelectTypeObject = {
    label: 'repository',
    value: 'repository',
  };
  const typeOptions: SelectTypeObject[] = [projectType, repositoryType];
  let defaultType = projectType;

  const publicAccessType: SelectPublicAccessObject = {
    label: 'public',
    value: AccessLevel.View,
  };
  const privateAccessType: SelectPublicAccessObject = {
    label: 'private',
    value: AccessLevel.None,
  };
  const publicAccessOptions: SelectPublicAccessObject[] = [
    publicAccessType,
    privateAccessType,
  ];
  const defaultPublicAccessLevel = publicAccessType;

  let defaultProjectName: string | undefined = undefined;
  if (args.location.search.length > 0) {
    const searchParams = new URLSearchParams(args.location.search);
    if (searchParams.has('type')) {
      const givenType = searchParams.get('type') as string;
      for (const option of typeOptions) {
        if (givenType === option.value) {
          defaultType = option;
        }
      }
    }
    if (searchParams.has('project')) {
      defaultProjectName = searchParams.get('project') as string;
    }
  }
  let defaultOwner: SelectOwnerObject | undefined = undefined;
  let username: string | undefined = undefined;
  if (!isSSR) {
    username = useSelector<RootState, string>(
      (state) => state.authReducer.username
    );
    defaultOwner = {
      label: username,
      value: username,
    };
  }
  const ownerOptions: SelectOwnerObject[] = [];
  if (defaultOwner) {
    ownerOptions.push(defaultOwner);
  }
  const [selectedProject, setSelectedProject] = useState<
    SelectProjectObject | undefined
  >(undefined);
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<
    SelectProjectObject[]
  >([]);
  const [defaultProject, setDefaultProject] = useState<
    SelectProjectObject | undefined
  >(undefined);
  const getProjects = async (
    inputValue: string
  ): Promise<SelectProjectObject[]> => {
    const projectData = await client.query<
      ProjectsQuery,
      ProjectsQueryVariables
    >({
      query: Projects,
      variables: {
        page: 0,
        perpage: perpageFilters.projects,
      },
      fetchPolicy: 'no-cache', // disable cache
    });
    if (projectData.data) {
      const filteredProjects =
        inputValue.length === 0
          ? projectData.data.projects
          : projectData.data.projects.filter((project) => {
              return project.name
                .toLowerCase()
                .includes(inputValue.toLowerCase());
            });
      const projectOptions = filteredProjects.map((project) => {
        const newSelectItem: SelectProjectObject = {
          label: project.name,
          value: new ObjectID(project._id),
        };
        return newSelectItem;
      });
      if (defaultProjectOptions.length === 0) {
        setDefaultProjectOptions(projectOptions);
      }
      return projectOptions;
    } else {
      throw new Error('cannot find projects data');
    }
  };
  if (defaultProjectName) {
    getProjects(defaultProjectName)
      .then(() => {
        setSelectedProject(
          defaultProjectOptions.find(
            (project) => project.label === defaultProjectName
          )
        );
        setDefaultProject(selectedProject);
      })
      .catch((_err) => {
        // handle error
      });
  } else {
    getProjects('').catch((_err) => {
      // handle error
    });
  }
  return (
    <PrivateRoute>
      <Layout location={args.location}>
        <SEO title="Login" />
        <Container className="input-container mt-4">
          <Card>
            <CardBody>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  type: defaultType.value,
                  owner: defaultOwner ? defaultOwner.value : undefined,
                  project: defaultProject,
                  publicAccessLevel: defaultPublicAccessLevel,
                  name: '',
                }}
                validationSchema={yup.object({
                  type: yup.string().required('type is required'),
                  owner: yup.string().required('owner is required'),
                  project: yup.object().when('type', {
                    is: repositoryType.value,
                    then: yup.object().required('project is required'),
                  }),
                  publicAccessLevel: yup.string().when('type', {
                    is: repositoryType.value,
                    then: yup
                      .string()
                      .required('public access level is required'),
                  }),
                  name: yup
                    .string()
                    .required('required')
                    .when('type', {
                      is: projectType.value,
                      then: yup.string().matches(validProjectName, {
                        message: 'invalid project name',
                      }),
                      otherwise: yup.string().matches(validRepositoryName, {
                        message: 'invalid repository name',
                      }),
                    })
                    .when('type', {
                      is: repositoryType.value,
                      then: yup
                        .string()
                        .notOneOf(
                          blacklistedRepositoryNames,
                          'blacklisted repository name'
                        ),
                    })
                    .when('type', {
                      is: projectType.value,
                      then: yup
                        .string()
                        .test(
                          'unqiue name',
                          'name is not unique',
                          async (name?: string) => {
                            if (!name || name.length === 0) return false;
                            try {
                              const createProjectRes = await client.query<
                                ProjectNameExistsQuery,
                                ProjectNameExistsQueryVariables
                              >({
                                query: ProjectNameExists,
                                variables: {
                                  name,
                                },
                              });
                              if (createProjectRes.errors) {
                                throw new Error(
                                  createProjectRes.errors.join(', ')
                                );
                              }
                              return !createProjectRes.data.projectNameExists;
                            } catch (err) {
                              toast(err.message, {
                                type: 'error',
                              });
                            }
                            return false;
                          }
                        ),
                      otherwise: yup
                        .string()
                        .test(
                          'unqiue name',
                          'name is not unique',
                          async (name?: string) => {
                            if (!name || name.length === 0) return false;
                            try {
                              const createRepositoryRes = await client.query<
                                RepositoryNameExistsQuery,
                                RepositoryNameExistsQueryVariables
                              >({
                                query: RepositoryNameExists,
                                variables: {
                                  name,
                                },
                              });
                              if (createRepositoryRes.errors) {
                                throw new Error(
                                  createRepositoryRes.errors.join(', ')
                                );
                              }
                              return !createRepositoryRes.data
                                .repositoryNameExists;
                            } catch (err) {
                              toast(err.message, {
                                type: 'error',
                              });
                            }
                            return false;
                          }
                        ),
                    }),
                })}
                onSubmit={async (formData, { setSubmitting, setStatus }) => {
                  const onError = () => {
                    setStatus({ success: false });
                    setSubmitting(false);
                  };
                  try {
                    if (formData.type === projectType.value) {
                      const createProjectRes = await client.mutate<
                        AddProjectMutation,
                        AddProjectMutationVariables
                      >({
                        mutation: AddProject,
                        variables: {
                          name: formData.name,
                        },
                      });
                      if (createProjectRes.errors) {
                        throw new Error(createProjectRes.errors.join(', '));
                      }
                    } else if (formData.type === repositoryType.value) {
                      if (!formData.project) {
                        throw new Error('no project selected');
                      }
                      const createRepositoryRes = await client.mutate<
                        AddRepositoryMutation,
                        AddRepositoryMutationVariables
                      >({
                        mutation: AddRepository,
                        variables: {
                          name: formData.name,
                          project: formData.project,
                          publicAccess: formData.publicAccessLevel.value,
                        },
                      });
                      if (createRepositoryRes.errors) {
                        throw new Error(createRepositoryRes.errors.join(', '));
                      }
                    } else {
                      throw new Error('invalid new type provided');
                    }
                    await new Promise<void>((resolve) =>
                      setTimeout(() => {
                        setStatus({ success: true });
                        switch (formData.type) {
                          case projectType.value:
                            navigate(`/${username}/projects/${formData.name}`);
                            break;
                          case repositoryType.value:
                            navigate(`/${username}/${formData.name}`);
                            break;
                          default:
                            break;
                        }
                        setSubmitting(false);
                        resolve();
                      }, 1000)
                    ); // wait for creation before routing
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
                  setTouched,
                  setFieldValue,
                }) => (
                  <Form>
                    <FormGroup>
                      <Label for="type">Type</Label>
                      <Select
                        id="type"
                        name="type"
                        isMulti={false}
                        options={typeOptions}
                        cacheOptions={true}
                        defaultValue={defaultType}
                        onChange={(
                          selectedOption: ValueType<SelectTypeObject>
                        ) => {
                          if (!selectedOption) {
                            selectedOption = null;
                          }
                          const selected = selectedOption as SelectTypeObject;
                          setFieldValue('type', selected.value);
                        }}
                        onBlur={(evt) => {
                          handleBlur(evt);
                          setTouched({
                            ...touched,
                            type: true,
                          });
                        }}
                        className={
                          touched.type && errors.type ? 'is-invalid' : ''
                        }
                        styles={{
                          control: (styles) => ({
                            ...styles,
                            borderColor:
                              touched.type && errors.type
                                ? 'red'
                                : styles.borderColor,
                          }),
                        }}
                        invalid={!!(touched.type && errors.type)}
                        disabled={isSubmitting}
                      />
                      <FormFeedback
                        style={{
                          marginBottom: '1rem',
                        }}
                        className="feedback"
                        type="invalid"
                      >
                        {touched.type && errors.type ? errors.type : ''}
                      </FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <Label for="type">Owner</Label>
                      <Select
                        id="owner"
                        name="owner"
                        isMulti={false}
                        cacheOptions={false}
                        options={ownerOptions}
                        defaultValue={defaultOwner}
                        onChange={(
                          selectedOption: ValueType<SelectOwnerObject>
                        ) => {
                          if (!selectedOption) {
                            selectedOption = null;
                          }
                          const selected = selectedOption as SelectOwnerObject;
                          setFieldValue('owner', selected.value);
                        }}
                        onBlur={(evt) => {
                          handleBlur(evt);
                          setTouched({
                            ...touched,
                            owner: true,
                          });
                        }}
                        className={
                          touched.owner && errors.owner ? 'is-invalid' : ''
                        }
                        styles={{
                          control: (styles) => ({
                            ...styles,
                            borderColor:
                              touched.owner && errors.owner
                                ? 'red'
                                : styles.borderColor,
                          }),
                        }}
                        invalid={!!(touched.owner && errors.owner)}
                        disabled={isSubmitting}
                      />
                      <FormFeedback
                        style={{
                          marginBottom: '1rem',
                        }}
                        className="feedback"
                        type="invalid"
                      >
                        {touched.owner && errors.owner ? errors.owner : ''}
                      </FormFeedback>
                    </FormGroup>
                    {values.type === projectType.value ? (
                      <></>
                    ) : (
                      <>
                        <FormGroup>
                          <Label for="type">Project</Label>
                          <AsyncSelect
                            id="project"
                            name="project"
                            isMulti={false}
                            defaultOptions={defaultProjectOptions}
                            cacheOptions={true}
                            loadOptions={getProjects}
                            value={selectedProject}
                            onChange={(
                              selectedOption: ValueType<SelectProjectObject>
                            ) => {
                              if (!selectedOption) {
                                selectedOption = null;
                              }
                              const selected = selectedOption as SelectProjectObject;
                              setSelectedProject(selected);
                              setFieldValue('project', selected.value);
                            }}
                            onBlur={(evt) => {
                              handleBlur(evt);
                              setTouched({
                                ...touched,
                                project: true,
                              });
                            }}
                            className={
                              touched.project && errors.project
                                ? 'is-invalid'
                                : ''
                            }
                            styles={{
                              control: (styles) => ({
                                ...styles,
                                borderColor:
                                  touched.project && errors.project
                                    ? 'red'
                                    : styles.borderColor,
                              }),
                            }}
                            invalid={!!(touched.project && errors.project)}
                            disabled={isSubmitting}
                          />
                          <FormFeedback
                            style={{
                              marginBottom: '1rem',
                            }}
                            className="feedback"
                            type="invalid"
                          >
                            {touched.project && errors.project
                              ? errors.project
                              : ''}
                          </FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label for="publicAccessLevel">Public Access</Label>
                          <Select
                            id="publicAccessLevel"
                            name="publicAccessLevel"
                            isMulti={false}
                            options={publicAccessOptions}
                            cacheOptions={true}
                            defaultValue={defaultPublicAccessLevel}
                            onChange={(
                              selectedOption: ValueType<
                                SelectPublicAccessObject
                              >
                            ) => {
                              if (!selectedOption) {
                                selectedOption = null;
                              }
                              const selected = selectedOption as SelectPublicAccessObject;
                              setFieldValue(
                                'publicAccessLevel',
                                selected.value
                              );
                            }}
                            onBlur={(evt) => {
                              handleBlur(evt);
                              setTouched({
                                ...touched,
                                // @ts-ignore
                                publicAccessLevel: true,
                              });
                            }}
                            className={
                              touched.publicAccessLevel &&
                              errors.publicAccessLevel
                                ? 'is-invalid'
                                : ''
                            }
                            styles={{
                              control: (styles) => ({
                                ...styles,
                                borderColor:
                                  touched.publicAccessLevel &&
                                  errors.publicAccessLevel
                                    ? 'red'
                                    : styles.borderColor,
                              }),
                            }}
                            invalid={
                              !!(
                                touched.publicAccessLevel &&
                                errors.publicAccessLevel
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
                            {touched.publicAccessLevel &&
                            errors.publicAccessLevel
                              ? errors.publicAccessLevel
                              : ''}
                          </FormFeedback>
                        </FormGroup>
                      </>
                    )}
                    <FormGroup>
                      <Label for="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Name"
                        className="form-input"
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
            </CardBody>
          </Card>
        </Container>
      </Layout>
    </PrivateRoute>
  );
};

export default NewPage;
