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
  const getProjects = async (inputValue: string): Promise<SelectObject[]> => {
    const projectData = await client.query<
      ProjectsQuery,
      ProjectsQueryVariables
    >({
      query: Projects,
      variables: {
        page: 0,
        perpage: 5,
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
  let dispatch: Dispatch<any>;
  let defaultProjectValue: SelectObject | null = null;
  if (!isSSR) {
    dispatch = useDispatch();
    const project = useSelector<RootState, ProjectState>(
      (state) => state.projectReducer
    );
    defaultProjectValue = project.id
      ? {
          label: project.name,
          value: new ObjectId(project.id),
        }
      : null;
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
            navigate('/project');
          }
        }}
      />
    </>
  );
};

export default ProjectSelector;
