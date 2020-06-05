import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
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
  Form,
  FormGroup,
  Input,
  FormFeedback,
} from 'reactstrap';
import { isLoggedIn } from '../../state/auth/getters';
import { store } from '../../state/reduxWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { navigate, WindowLocation } from '@reach/router';
import { isSSR } from '../../utils/checkSSR';
import { AppThunkDispatch } from '../../state/thunk';
import { AuthActionTypes } from '../../state/auth/types';
import { thunkLogout } from '../../state/auth/thunks';
import { Formik } from 'formik';
import { Dispatch } from 'redux';
import { RootState } from '../../state';
import { setQuery } from '../../state/search/actions';
import { getSearchURL } from '../../state/search/getters';
import { SearchActionTypes } from '../../state/search/types';
import { thunkSearch } from '../../state/search/thunks';
import { toast } from 'react-toastify';

interface HeaderArgs {
  siteTitle: string;
  location: WindowLocation;
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
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
    dispatch = useDispatch();
  }
  const initialQuery = isSSR
    ? undefined
    : useSelector<RootState, string>((state) => state.searchReducer.query);
  return (
    <>
      <Navbar color="light" light expand="md">
        <NavbarBrand tag={Link} to="/">
          {args.siteTitle}
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            {args.location.pathname === '/' ? null : (
              <Formik
                initialValues={{
                  query: initialQuery as string,
                }}
                validationSchema={yup.object({
                  query: yup.string().required('required'),
                })}
                onSubmit={async (formData, { setSubmitting, setStatus }) => {
                  dispatch(
                    setQuery({
                      query: formData.query,
                    })
                  );
                  navigate(getSearchURL());
                  if (args.location.pathname === '/search') {
                    dispatchSearchThunk(thunkSearch())
                      .then(() => {
                        setStatus({ success: true });
                      })
                      .catch((err: Error) => {
                        setStatus({ success: false });
                        toast(err.message, {
                          type: 'error',
                        });
                      })
                      .then(() => {
                        setSubmitting(false);
                      });
                    console.log('search in header');
                  } else {
                    setSubmitting(false);
                    setStatus({ success: true });
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
                }) => (
                  <>
                    <Form
                      style={{
                        margin: 0,
                      }}
                    >
                      <FormGroup
                        style={{
                          margin: 0,
                        }}
                      >
                        <Input
                          id="query"
                          name="query"
                          type="text"
                          placeholder="search term"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.query}
                          invalid={!!(touched.query && errors.query)}
                          disabled={isSubmitting}
                          onKeyDown={(evt: React.KeyboardEvent) => {
                            if (evt.key === 'Enter') {
                              evt.preventDefault();
                              handleSubmit();
                            }
                          }}
                        />
                        <FormFeedback className="feedback" type="invalid">
                          {touched.query && errors.query ? errors.query : ''}
                        </FormFeedback>
                      </FormGroup>
                    </Form>
                  </>
                )}
              </Formik>
            )}
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
                  <NavLink key="account" tag={Link} to="/account">
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
                          dispatchAuthThunk(thunkLogout())
                            .catch((err: Error) => console.error(err))
                            .then(() => navigate('/login'));
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
