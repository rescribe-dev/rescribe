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
import { isLoggedIn } from '../../state/auth/getters';
import { store } from '../../state/reduxWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { navigate } from '@reach/router';
import { isSSR } from '../../utils/checkSSR';
import { AppThunkDispatch } from '../../state/thunk';
import { AuthActionTypes } from '../../state/auth/types';
import { thunkLogout } from '../../state/auth/thunks';
import { RootState } from '../../state';
import ProjectSelector from '../projectSelector';

interface HeaderArgs {
  siteTitle: string;
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
  let project: string | null = null;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    project = useSelector<RootState, string | null>(
      (state) => state.projectReducer.id
    );
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
            {!loggedIn
              ? [
                  <NavLink key="register" tag={Link} to="/register">
                    Register
                  </NavLink>,
                  <NavLink key="login" tag={Link} to="/login">
                    Login
                  </NavLink>,
                ]
              : [
                  <NavLink key="account" tag={Link} to="/app/account">
                    Account
                  </NavLink>,
                  <NavItem
                    key="select-project"
                    style={{
                      minWidth: '10rem',
                    }}
                  >
                    <ProjectSelector />
                  </NavItem>,
                  project !== null ? (
                    [
                      <NavLink key="project" tag={Link} to="/app/project">
                        Project
                      </NavLink>,
                      <NavLink key="search" tag={Link} to="/app/search">
                        Search
                      </NavLink>,
                    ]
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
                ]}
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
