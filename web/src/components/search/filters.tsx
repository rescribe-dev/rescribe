import React, { useState } from 'react';
import { Container, Form, Label, FormGroup } from 'reactstrap';
import './index.scss';

import SEO from '../../components/seo';
import ObjectId from 'bson-objectid';
import {
  RepositoriesQuery,
  RepositoriesQueryVariables,
  Repositories,
  ProjectsQuery,
  ProjectsQueryVariables,
  Projects,
} from '../../lib/generated/datamodel';
import { client } from '../../utils/apollo';
import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';

interface SelectObject {
  value: ObjectId;
  label: string;
}

interface FiltersPropsDataType {
  onChangeRepositories: (repositories: ObjectId[]) => void;
  onChangeProjects: (projects: ObjectId[]) => void;
}

const Filters = (args: FiltersPropsDataType) => {
  const [selectedProjects, setSelectedProjects] = useState<SelectObject[]>([]);
  const getProjects = async (inputValue: string): Promise<SelectObject[]> => {
    const projectData = await client.query<
      ProjectsQuery,
      ProjectsQueryVariables
    >({
      query: Projects,
      variables: {},
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
    const repositoriesData = await client.query<
      RepositoriesQuery,
      RepositoriesQueryVariables
    >({
      query: Repositories,
      variables: {
        projects: selectedProjects,
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
      <SEO title="Project" />
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
                args.onChangeProjects(projects);
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
                args.onChangeRepositories(repositories);
              }}
            />
          </FormGroup>
        </Form>
      </Container>
    </>
  );
};

export default Filters;
