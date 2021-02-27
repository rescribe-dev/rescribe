import React, { useState, useEffect } from 'react';
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

import {
  validProjectName,
  validRepositoryName,
  blacklistedRepositoryNames,
} from 'shared/variables';
import { perpageFilters } from 'utils/variables';
import ObjectID from 'bson-objectid';
import AsyncSelect from 'react-select/async';
import Select, { ValueType } from 'react-select';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import {
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
  AddProjectMutation,
  AddProjectMutationVariables,
  Projects,
  ProjectsQuery,
  ProjectsQueryVariables,
} from 'lib/generated/datamodel';
import { client } from 'utils/apollo';
import { NewMessages } from 'locale/pages/new/newMessages';
import sleep from 'shared/sleep';

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
export interface NewPageDataProps extends PageProps {}

interface NewProps extends NewPageDataProps {
  messages: NewMessages;
}

const NewPage = (args: NewProps): JSX.Element => {
  const projectType: SelectTypeObject = {
    label: 'Project',
    value: 'project',
  };
  const repositoryType: SelectTypeObject = {
    label: 'Repository',
    value: 'repository',
  };
  const typeOptions: SelectTypeObject[] = [projectType, repositoryType];
  const [defaultType, setDefaultType] = useState<SelectTypeObject>(projectType);

  const [loading, setLoading] = useState<boolean>(true);

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
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<
    SelectProjectObject[]
  >([]);
  const [noProjectID] = useState<ObjectID>(new ObjectID());
  const noneProject: SelectProjectObject = {
    label: 'None',
    value: noProjectID,
  };
  const [defaultProject, setDefaultProject] = useState<SelectProjectObject>(
    noneProject
  );
  const [selectedProject, setSelectedProject] = useState<SelectProjectObject>(
    noneProject
  );

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
      projectOptions.push(noneProject);
      // TODO - fix this
      if (defaultProjectOptions.length === 0) {
        setDefaultProjectOptions(projectOptions);
      }
      return projectOptions;
    } else {
      throw new Error('cannot find projects data');
    }
  };

  useEffect(() => {
    (async (): Promise<void> => {
      let defaultProjectName: string | undefined = undefined;
      if (args.location.search.length > 0) {
        const searchParams = new URLSearchParams(args.location.search);
        if (searchParams.has('type')) {
          const givenType = searchParams.get('type') as string;
          for (const option of typeOptions) {
            if (givenType === option.value) {
              setDefaultType(option);
            }
          }
        }
        if (searchParams.has('project')) {
          defaultProjectName = searchParams.get('project') as string;
        }
      }
      try {
        const newProjectOptions = await getProjects(
          defaultProjectName ? defaultProjectName : ''
        );
        if (defaultProjectName) {
          const newDefaultProject = newProjectOptions.find(
            (project) => project.label === defaultProjectName
          );
          if (newDefaultProject) {
            setSelectedProject(newDefaultProject);
            setDefaultProject(newDefaultProject);
          }
        }
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <Container className="input-container mt-4">
      <Card>
        <CardBody>
          {loading ? (
            <p>loading</p>
          ) : (
            <div>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  type: defaultType.value,
                  owner: defaultOwner ? defaultOwner.value : undefined,
                  project: defaultProject,
                  publicAccessLevel: defaultPublicAccessLevel.value,
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
                          async (name) => {
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
                          async (name) => {
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
                onSubmit={async (
                  formData,
                  { setSubmitting, setStatus }
                ): Promise<void> => {
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
                      const project = formData.project.value.equals(noProjectID)
                        ? undefined
                        : formData.project.value;

                      const createRepositoryRes = await client.mutate<
                        AddRepositoryMutation,
                        AddRepositoryMutationVariables
                      >({
                        mutation: AddRepository,
                        variables: {
                          name: formData.name,
                          project,
                          publicAccess: formData.publicAccessLevel,
                        },
                      });
                      if (createRepositoryRes.errors) {
                        throw new Error(createRepositoryRes.errors.join(', '));
                      }
                    } else {
                      throw new Error('invalid new type provided');
                    }
                    // wait for creation before routing
                    await sleep(1000);
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
                  } catch (err) {
                    console.log(JSON.stringify(err, null, 2));
                    toast(err.message, {
                      type: 'error',
                    });
                    setStatus({ success: false });
                    setSubmitting(false);
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
                  setFieldTouched,
                }) => (
                  <Form onSubmit={handleSubmit}>
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
                          selectedOption: ValueType<SelectTypeObject, false>
                        ) => {
                          if (!selectedOption) {
                            selectedOption = null;
                          }
                          const selected = selectedOption as SelectTypeObject;
                          setFieldValue('type', selected.value);
                        }}
                        onBlur={(evt) => {
                          handleBlur(evt);
                          setFieldTouched('type', true);
                        }}
                        className={
                          touched.type && errors.type ? 'is-invalid' : ''
                        }
                        styles={{
                          control: (styles) => ({
                            ...styles,
                            borderColor:
                              touched.type && errors.type
                                ? 'var(--red-stop)'
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
                          selectedOption: ValueType<SelectOwnerObject, false>
                        ) => {
                          if (!selectedOption) {
                            selectedOption = null;
                          }
                          const selected = selectedOption as SelectOwnerObject;
                          setFieldValue('owner', selected.value);
                        }}
                        onBlur={(evt) => {
                          handleBlur(evt);
                          setFieldTouched('owner', true);
                        }}
                        className={
                          touched.owner && errors.owner ? 'is-invalid' : ''
                        }
                        styles={{
                          control: (styles) => ({
                            ...styles,
                            borderColor:
                              touched.owner && errors.owner
                                ? 'var(--red-stop)'
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
                              selectedOption: ValueType<
                                SelectProjectObject,
                                false
                              >
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
                              setFieldTouched('project', true);
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
                                    ? 'var(--red-stop)'
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
                                SelectPublicAccessObject,
                                false
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
                              setFieldTouched('publicAccessLevel', true);
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
                                    ? 'var(--red-stop)'
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
                      color="var(--red-stop)"
                      loading={isSubmitting}
                    />
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default NewPage;
