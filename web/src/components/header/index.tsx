import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarToggler,
  Collapse,
  NavLink,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavItem,
} from 'reactstrap';
import gql from 'graphql-tag';
import AsyncSelect from 'react-select/async';
import ObjectId from 'bson-objectid';
import { isLoggedIn } from '../../state/auth/getters';
import { store } from '../../state/reduxWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '@reach/router';
import { isSSR } from '../../utils/checkSSR';
import { AppThunkDispatch } from '../../state/thunk';
import { AuthActionTypes } from '../../state/auth/types';
import { thunkLogout } from '../../state/auth/thunks';
import { client } from '../../utils/apollo';
import { ValueType, ActionMeta } from 'react-select';
import { Dispatch } from 'redux';
import { setProject } from '../../state/project/actions';
import { RootState } from '../../state';
import { ProjectState } from '../../state/project/types';

interface HeaderArgs {
  siteTitle: string;
}

const projects = gql`
  query projects {
    projects {
      _id
      name
    }
  }
`;

interface Project {
  _id: string;
  name: string;
}

interface ProjectsRes {
  projects: Project[];
}

interface SelectObject {
  value: ObjectId;
  label: string;
}

// https://www.apollographql.com/docs/react/api/react-hooks/#usequery
const Header = (args: HeaderArgs) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [loggedIn, setLoggedIn] = useState(false);
  isLoggedIn()
    .then((loggedIn) => {
      setLoggedIn(loggedIn);
    })
    .catch((_err) => {
      // handle error
    });
  // useEffect needs to be top-level (not in if statement)
  useEffect(() => {
    // run unsubscribe on unmount
    return store.subscribe(() => loggedIn);
  }, []);
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
  }
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
    const projectData = await client.query<ProjectsRes>({
      query: projects,
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
      <Navbar color="light" light expand="md">
        <NavbarBrand tag={Link} to="/">
          {args.siteTitle}
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavLink key="home" tag={Link} to="/">
              Home
            </NavLink>
            {!loggedIn ? (
              <NavLink key="login" tag={Link} to="/login">
                Login
              </NavLink>
            ) : (
              [
                <NavLink key="account" tag={Link} to="/app/account">
                  Account
                </NavLink>,
                <NavItem
                  key="select-project"
                  style={{
                    minWidth: '10rem',
                  }}
                >
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
                </NavItem>,
                project.id !== null ? (
                  <NavLink key="project" tag={Link} to="/app/project">
                    Project
                  </NavLink>
                ) : (
                  <div key="no-project"></div>
                ),
                <UncontrolledDropdown key="dropdown" nav inNavbar>
                  <DropdownToggle key="toggle-options" nav caret>
                    Options
                  </DropdownToggle>
                  <DropdownMenu key="menu" right>
                    <DropdownItem
                      key="logout"
                      onClick={(evt: React.MouseEvent) => {
                        evt.preventDefault();
                        dispatchAuthThunk(thunkLogout());
                        navigate('/login');
                      }}
                    >
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>,
              ]
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: 'Rescribe',
};

export default Header;
