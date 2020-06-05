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
import { perpageFilters } from '../../../utils/config';

interface SelectObject {
  value: ObjectId;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FiltersPropsDataType {}

const Filters = (_args: FiltersPropsDataType) => {
  const [selectedProjects, setSelectedProjects] = useState<SelectObject[]>([]);
  const projects = isSSR
    ? undefined
    : useSelector<RootState, ObjectId[] | undefined>(
        (state) => state.searchReducer.filters.projects
      );
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
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
    });
    if (projectData.data) {
      return projectData.data.projects
        .filter((project) => {
          return project.name.toLowerCase().includes(inputValue.toLowerCase());
        })
        .map((project) => {
          const newSelectItem: SelectObject = {
            label: project.name,
            value: new ObjectId(project._id),
          };
          return newSelectItem;
        });
    } else {
      throw new Error('cannot find projects data');
    }
  };
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
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <Form key="form">
          <FormGroup>
            <Label for="repository">Repository</Label>
            <AsyncSelect
              id="project"
              name="project"
              isMulti={true}
              cacheOptions={false}
              loadOptions={getProjects}
              value={selectedProjects}
              onChange={(selectedOptions: ValueType<SelectObject>) => {
                if (!selectedOptions) {
                  selectedOptions = [];
                }
                const selected = selectedOptions as SelectObject[];
                setSelectedProjects(selected);
                const projects = selected.map((project) => project.value);
                dispatch(
                  setProjects({
                    projects,
                  })
                );
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="repository">Repository</Label>
            <AsyncSelect
              id="repositories"
              name="repositories"
              isMulti={true}
              cacheOptions={false}
              isDisabled={selectedProjects.length === 0}
              loadOptions={getRepositories}
              onChange={(selectedOptions: ValueType<SelectObject>) => {
                if (!selectedOptions) {
                  selectedOptions = [];
                }
                const repositories = (selectedOptions as SelectObject[]).map(
                  (repository) => repository.value
                );
                dispatch(
                  setRepositories({
                    repositories,
                  })
                );
              }}
            />
          </FormGroup>
        </Form>
      </Container>
    </>
  );
};

export default Filters;
