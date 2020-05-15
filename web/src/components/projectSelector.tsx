import React from 'react';
import AsyncSelect from 'react-select/async';
import ObjectId from 'bson-objectid';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '@reach/router';
import { isSSR } from '../utils/checkSSR';
import { client } from '../utils/apollo';
import { ValueType, ActionMeta } from 'react-select';
import { Dispatch } from 'redux';
import { setProject } from '../state/project/actions';
import { RootState } from '../state';
import { ProjectState } from '../state/project/types';
import {
  Projects,
  ProjectsQuery,
  ProjectsQueryVariables,
} from '../lib/generated/datamodel';

interface SelectObject {
  value: ObjectId;
  label: string;
}

// https://www.apollographql.com/docs/react/api/react-hooks/#usequery
const ProjectSelector = () => {
  const project = useSelector<RootState, ProjectState>(
    (state) => state.projectReducer
  );
  const defaultProjectValue: SelectObject | null = project.id
    ? {
        label: project.name,
        value: new ObjectId(project.id),
      }
    : null;
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
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatch = useDispatch();
  }
  return (
    <>
      <AsyncSelect
        cacheOptions={false}
        loadOptions={getProjects}
        defaultValue={defaultProjectValue}
        onChange={(
          value: ValueType<SelectObject>,
          action: ActionMeta<SelectObject>
        ) => {
          const valueObj = value as SelectObject;
          if (action.action === 'select-option') {
            dispatch(
              setProject({
                name: valueObj.label,
                id: valueObj.value.toHexString(),
              })
            );
            navigate('/app/project');
          }
        }}
      />
    </>
  );
};

export default ProjectSelector;
