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
} from 'reactstrap';
import { isLoggedIn } from '../../state/auth/getters';
import { store } from '../../state/reduxWrapper';
import { useDispatch } from 'react-redux';
import { navigate } from '@reach/router';
import { isSSR } from '../../utils/checkSSR';
import { AppThunkDispatch } from '../../state/thunk';
import { AuthActionTypes } from '../../state/auth/types';
import { thunkLogout } from '../../state/auth/thunks';

interface HeaderArgs {
  siteTitle: string;
}

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
