import { Link, navigate } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
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
  Row,
  Col,
  Container,
} from 'reactstrap';
import { isLoggedIn } from 'state/auth/getters';
import { useDispatch, useSelector } from 'react-redux';
import { WindowLocation, createHistory, HistorySource } from '@reach/router';
import { isSSR } from 'utils/checkSSR';
import { AppThunkDispatch } from 'state/thunk';
import { AuthActionTypes } from 'state/auth/types';
import { thunkLogout } from 'state/auth/thunks';
import { Formik, FormikValues } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Dispatch } from 'redux';
import { RootState } from 'state';
import { setQuery } from 'state/search/actions';
import { getSearchURL, getQuery } from 'state/search/getters';
import { SearchActionTypes } from 'state/search/types';
import { thunkSearch } from 'state/search/thunks';
import { toast } from 'react-toastify';

import './index.scss';
import { queryMinLength } from 'shared/variables';
import sleep from 'shared/sleep';
import { capitalizeFirstLetter } from 'utils/misc';

interface HeaderArgs {
  siteTitle: string;
  location: WindowLocation | string;
}

// https://www.apollographql.com/docs/react/api/react-hooks/#usequery
const Header = (args: HeaderArgs): JSX.Element => {
  const [headerIsOpen, setHeaderIsOpen] = useState(false);
  const toggleHeader = () => setHeaderIsOpen(!headerIsOpen);

  const pathname =
    typeof location === 'string'
      ? location
      : (args.location as WindowLocation).pathname;

  isLoggedIn()
    .then((_loggedIn) => {
      // user logged in
    })
    .catch((_err) => {
      // handle error
    });
  const loggedIn = isSSR
    ? undefined
    : useSelector<RootState, boolean | undefined>(
        (state) => state.authReducer.loggedIn
      );
  const username = isSSR
    ? undefined
    : useSelector<RootState, string | undefined>(
        (state) => state.authReducer.username
      );
  let dispatchAuthThunk: AppThunkDispatch<AuthActionTypes>;
  let dispatchSearchThunk: AppThunkDispatch<SearchActionTypes>;
  let dispatch: Dispatch<any>;
  if (!isSSR) {
    dispatchAuthThunk = useDispatch<AppThunkDispatch<AuthActionTypes>>();
    dispatchSearchThunk = useDispatch<AppThunkDispatch<SearchActionTypes>>();
    dispatch = useDispatch();
  }

  const formRef = useRef<FormikValues>();
  useEffect(() => {
    // only run on component mount
    // on back button push run search again
    // hack to get typescript working:
    const history = createHistory((window as unknown) as HistorySource);
    return history.listen(async (listener) => {
      // wait for react to update state
      await sleep(50);
      if (
        listener.location.pathname === '/search' &&
        formRef &&
        formRef.current
      ) {
        formRef.current.setFieldValue('query', getQuery());
      }
    });
  }, []);

  return (
    <>
      <Navbar light expand="md">
        <NavbarBrand tag={Link} to="/">
          {args.siteTitle}
        </NavbarBrand>
        <Container fluid>
          <Row
            style={{
              width: '100%',
            }}
          >
            {pathname === '/' ? null : (
              <Col sm={{ size: 3 }}>
                <Formik
                  innerRef={(formRef as unknown) as (instance: any) => void}
                  initialValues={{
                    query: getQuery(),
                  }}
                  validationSchema={yup.object({
                    query: yup
                      .string()
                      .required('required')
                      .min(queryMinLength),
                  })}
                  onSubmit={async (formData, { setSubmitting, setStatus }) => {
                    dispatch(setQuery(formData.query));
                    await navigate(getSearchURL());
                    if (pathname === '/search') {
                      // hack to allow for react state to update before search
                      await sleep(50);
                      try {
                        await dispatchSearchThunk(thunkSearch());
                      } catch (err) {
                        setStatus({ success: false });
                        toast(err.message, {
                          type: 'error',
                        });
                      }
                      setSubmitting(false);
                    } else {
                      setSubmitting(false);
                      setStatus({ success: true });
                    }
                  }}
                >
                  {({
                    errors,
                    touched,
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <>
                      <Form
                        inline
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <FormGroup
                          style={{
                            marginBottom: 0,
                            width: '100%',
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
                            style={{
                              width: '100%',
                            }}
                            onKeyDown={(evt: React.KeyboardEvent) => {
                              if (evt.key === 'Enter') {
                                evt.preventDefault();
                                handleSubmit();
                              }
                            }}
                          />
                          <FormFeedback
                            className="feedback"
                            type="invalid"
                            style={{
                              maxWidth: '100%',
                            }}
                          >
                            {touched.query && errors.query ? errors.query : ''}
                          </FormFeedback>
                        </FormGroup>
                      </Form>
                    </>
                  )}
                </Formik>
              </Col>
            )}
            <Col xs={'auto'}>
              <NavbarToggler onClick={toggleHeader} />
              <Collapse isOpen={headerIsOpen} navbar>
                <Nav navbar className="mr-auto">
                  <NavLink className="navbar-link" tag={Link} to="/">
                    <FormattedMessage id="how it works">
                      {(messages: string[]) =>
                        capitalizeFirstLetter(messages[0])
                      }
                    </FormattedMessage>
                  </NavLink>
                  <NavLink className="navbar-link" tag={Link} to="/">
                    <FormattedMessage id="pricing">
                      {(messages: string[]) =>
                        capitalizeFirstLetter(messages[0])
                      }
                    </FormattedMessage>
                  </NavLink>
                  <NavLink className="navbar-link" tag={Link} to="/search">
                    <FormattedMessage id="explore">
                      {(messages: string[]) =>
                        capitalizeFirstLetter(messages[0])
                      }
                    </FormattedMessage>
                  </NavLink>
                  {loggedIn
                    ? [
                        <NavLink
                          className="navbar-link"
                          tag={Link}
                          to={username ? `/${username}/projects` : '#'}
                          key="projecs"
                        >
                          <FormattedMessage id="projects">
                            {(messages: string[]) =>
                              capitalizeFirstLetter(messages[0])
                            }
                          </FormattedMessage>
                        </NavLink>,
                      ]
                    : [
                        <NavLink
                          className="navbar-link"
                          tag={Link}
                          key="sign-up"
                          to="/signup"
                        >
                          <FormattedMessage id="sign up">
                            {(messages: string[]) =>
                              capitalizeFirstLetter(messages[0])
                            }
                          </FormattedMessage>
                        </NavLink>,
                        <NavLink
                          className="navbar-link"
                          tag={Link}
                          to="/login"
                          key="login"
                        >
                          <FormattedMessage id="login">
                            {(messages: string[]) =>
                              capitalizeFirstLetter(messages[0])
                            }
                          </FormattedMessage>
                        </NavLink>,
                      ]}
                </Nav>
                {!loggedIn ? null : (
                  <UncontrolledDropdown inNavbar>
                    <DropdownToggle className="navbar-text" nav caret>
                      Account
                    </DropdownToggle>
                    <DropdownMenu key="menu" right>
                      <DropdownItem
                        key="profile"
                        onClick={(evt: React.MouseEvent) => {
                          evt.preventDefault();
                          navigate(`/${username}`);
                        }}
                      >
                        Profile
                      </DropdownItem>
                      <DropdownItem
                        key="settings"
                        onClick={(evt: React.MouseEvent) => {
                          evt.preventDefault();
                          navigate('/account');
                        }}
                      >
                        Settings
                      </DropdownItem>
                      <DropdownItem
                        key="logout"
                        onClick={(evt: React.MouseEvent) => {
                          evt.preventDefault();
                          dispatchAuthThunk(thunkLogout())
                            .catch((err: Error) => console.error(err))
                            .then(() => {
                              // navigate('/login')
                            });
                        }}
                      >
                        Logout
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
              </Collapse>
            </Col>
          </Row>
        </Container>
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
