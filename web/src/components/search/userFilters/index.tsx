import React, { useState } from 'react';
import { Container, Form, Label, FormGroup } from 'reactstrap';
import ObjectId from 'bson-objectid';
import {
  RepositoriesQuery,
  RepositoriesQueryVariables,
  Repositories,
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
} from '../../../lib/generated/datamodel';
import { client } from '../../../utils/apollo';
import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { Dispatch } from 'redux';
import { isSSR } from '../../../utils/checkSSR';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../state';
import { setProjects, setRepositories } from '../../../state/search/actions';
import { perpageFilters } from '../../../utils/variables';

interface SelectObject {
  value: ObjectId;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserFiltersPropsDataType {}

const UserFilters = (_args: UserFiltersPropsDataType) => {
  const [selectedProjects, setSelectedProjects] = useState<SelectObject[]>([]);
  const [selectedRepositories, setSelectedRepositories] = useState<
    SelectObject[]
  >([]);
  const projects = isSSR
    ? undefined
    : useSelector<RootState, ObjectId[] | undefined>(
        (state) => state.searchReducer.filters.projects
      );
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  const [defaultProjectOptions, setDefaultProjectOptions] = useState<
    SelectObject[]
  >([]);
  const getProjects = async (inputValue: string): Promise<SelectObject[]> => {
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
        const newSelectItem: SelectObject = {
          label: project.name,
          value: new ObjectId(project._id),
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
  getProjects('').catch((_err) => {
    // handle error
  });
  const getRepositories = async (
    inputValue: string
  ): Promise<SelectObject[]> => {
    if (!projects) {
      return [];
    }
    const repositoriesData = await client.query<
      RepositoriesQuery,
      RepositoriesQueryVariables
    >({
      query: Repositories,
      variables: {
        projects,
        page: 0,
        perpage: perpageFilters.repositories,
      },
      fetchPolicy: 'no-cache', // disable cache
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
  return (
    <>
      <Container
        className='default-container'
      >
        <Form key="form">
          <FormGroup
            style={{
              width: '100%',
            }}
          >
            <Label for="projects">Project(s)</Label>
            <AsyncSelect
              id="projects"
              name="projects"
              isMulti={true}
              cacheOptions={false}
              loadOptions={getProjects}
              defaultOptions={defaultProjectOptions}
              value={selectedProjects}
              onChange={(selectedOptions: ValueType<SelectObject>) => {
                if (!selectedOptions) {
                  selectedOptions = [];
                }
                const selected = selectedOptions as SelectObject[];
                setSelectedProjects(selected);
                const projects = selected.map((project) => project.value);
                dispatch(setProjects(projects));
                if (selected.length === 0) {
                  setSelectedRepositories([]);
                }
              }}
            />
          </FormGroup>
          <FormGroup
            style={{
              width: '100%',
            }}
          >
            <Label for="repositories">Repositories</Label>
            <AsyncSelect
              id="repositories"
              name="repositories"
              isMulti={true}
              cacheOptions={false}
              defaultOptions={true}
              value={selectedRepositories}
              isDisabled={selectedProjects.length !== 1}
              loadOptions={getRepositories}
              onChange={(selectedOptions: ValueType<SelectObject>) => {
                if (!selectedOptions) {
                  selectedOptions = [];
                }
                const selected = selectedOptions as SelectObject[];
                setSelectedRepositories(selected);
                const repositories = selected.map(
                  (repository) => repository.value
                );
                dispatch(setRepositories(repositories));
              }}
            />
          </FormGroup>
        </Form>
      </Container>
    </>
  );
};

export default UserFilters;
