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
  Container,
  Label,
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
import logo from 'assets/images/logo.svg';
import logoWhite from 'assets/images/logo-white.svg';
import VisibilitySensor from 'react-visibility-sensor';

import './index.scss';
import { queryMinLength } from 'shared/variables';
import sleep from 'shared/sleep';
import { capitalizeFirstLetter } from 'utils/misc';
import { FiSettings } from 'react-icons/fi';
import LanguageSelector from 'components/LanguageSelector';
import ThemeSelector from 'components/ThemeSelector';
import { Theme, darkThemes } from 'utils/theme';

interface HeaderArgs {
  siteTitle: string;
  location: WindowLocation | string;
}

const noQuickSearchPaths = ['/', '/search'];

const homepagePath = '/';

// https://www.apollographql.com/docs/react/api/react-hooks/#usequery
const Header = (args: HeaderArgs): JSX.Element => {
  const [headerIsOpen, setHeaderIsOpen] = useState(false);
  const toggleHeader = () => setHeaderIsOpen(!headerIsOpen);

  const [hamburgerIsVisible, setHamburgerVisible] = useState(false);

  const pathname =
    typeof location === 'string'
      ? location
      : typeof args.location === 'string'
      ? args.location
      : (args.location as WindowLocation).pathname;

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
    (async () => {
      // trigger check to see if user is logged in
      try {
        await isLoggedIn();
      } catch (_err) {
        // handle error
      }

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
    })();
  }, []);

  const currentTheme = isSSR
    ? undefined
    : useSelector<RootState, Theme | undefined>(
        (state) => state.settingsReducer.theme
      );

  const transparentHeader = () =>
    pathname === homepagePath && !hamburgerIsVisible && !headerIsOpen;

  return (
    <div
      className={
        transparentHeader() ? 'navbar-home-background' : 'navbar-background'
      }
    >
      <Container
        className={transparentHeader() ? 'nav-container-home' : 'navbar-other'}
        style={{
          padding: 0,
        }}
      >
        <Navbar
          light
          expand="lg"
          className={transparentHeader() ? 'navbar-home' : ''}
        >
          <NavbarBrand
            style={{
              paddingTop: 0,
            }}
            tag={Link}
            to="/"
          >
            <img
              src={
                transparentHeader() ||
                (currentTheme && darkThemes.includes(currentTheme))
                  ? logoWhite
                  : logo
              }
              alt="reScribe"
              style={{
                width: '9rem',
                marginBottom: 0,
                marginRight: '2rem',
              }}
            />
          </NavbarBrand>
          <div
            className={
              currentTheme && darkThemes.includes(currentTheme)
                ? 'navbar-dark'
                : 'navbar-light'
            }
          >
            <VisibilitySensor
              onChange={setHamburgerVisible}
              partialVisibility={true}
            >
              <NavbarToggler onClick={toggleHeader} />
            </VisibilitySensor>
          </div>
          <Collapse isOpen={headerIsOpen} navbar>
            <Nav navbar className="mr-auto">
              {/*<NavLink className="navbar-link" tag={Link} to="/start">
                <span>
                  <FormattedMessage id="start">
                    {(messages: string[]) => (
                      <>{capitalizeFirstLetter(messages[0])}</>
                    )}
                  </FormattedMessage>
                </span>
              </NavLink>*/}
              <NavLink className="navbar-link" tag={Link} to="/pricing">
                <span>
                  <FormattedMessage id="pricing">
                    {(messages: string[]) => (
                      <>{capitalizeFirstLetter(messages[0])}</>
                    )}
                  </FormattedMessage>
                </span>
              </NavLink>
              {/* <NavLink className="navbar-link" tag={Link} to="/explore">
                <span>
                  <FormattedMessage id="explore">
                    {(messages: string[]) => (
                      <>{capitalizeFirstLetter(messages[0])}</>
                    )}
                  </FormattedMessage>
                </span>
              </NavLink> */}
              {loggedIn
                ? [
                    <NavLink
                      className="navbar-link"
                      tag={Link}
                      to={username ? `/${username}/projects` : '#'}
                      key="projects"
                    >
                      <span>
                        <FormattedMessage id="projects">
                          {(messages: string[]) => (
                            <>{capitalizeFirstLetter(messages[0])}</>
                          )}
                        </FormattedMessage>
                      </span>
                    </NavLink>,
                    <NavLink
                      className="navbar-link"
                      tag={Link}
                      to={username ? `/${username}/repositories` : '#'}
                      key="repositories"
                    >
                      <span>
                        <FormattedMessage id="repositories">
                          {(messages: string[]) => (
                            <>{capitalizeFirstLetter(messages[0])}</>
                          )}
                        </FormattedMessage>
                      </span>
                    </NavLink>,
                  ]
                : []}
            </Nav>
            <Nav navbar>
              {noQuickSearchPaths.includes(pathname) ? null : (
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
                    setSubmitting(true);
                    dispatch(setQuery(formData.query));
                    await navigate(getSearchURL());
                    if (pathname === '/search') {
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
                        onSubmit={handleSubmit}
                        style={{
                          marginBottom: 0,
                          maxWidth: '15rem',
                          marginRight: '1rem',
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
                            placeholder="search for"
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
              )}
              <UncontrolledDropdown inNavbar>
                <DropdownToggle className="navbar-text" nav caret>
                  {/* put profile picture or settings icon here */}
                  {loggedIn ? 'Account' : <FiSettings />}
                </DropdownToggle>
                <DropdownMenu key="menu" right>
                  {loggedIn
                    ? [
                        <DropdownItem
                          key="profile"
                          onClick={(evt: React.MouseEvent) => {
                            evt.preventDefault();
                            navigate(`/${username}`);
                          }}
                        >
                          Profile
                        </DropdownItem>,
                        <DropdownItem
                          key="settings"
                          onClick={(evt: React.MouseEvent) => {
                            evt.preventDefault();
                            navigate('/account');
                          }}
                        >
                          Settings
                        </DropdownItem>,
                      ]
                    : null}
                  <DropdownItem
                    key="language-select"
                    toggle={false}
                    style={{
                      minWidth: '18rem',
                    }}
                  >
                    <Label for="language">Language</Label>
                    <LanguageSelector />
                  </DropdownItem>
                  <DropdownItem
                    key="theme-select"
                    toggle={false}
                    style={{
                      minWidth: '18rem',
                    }}
                  >
                    <Label for="theme">Theme</Label>
                    <ThemeSelector />
                  </DropdownItem>
                  {loggedIn ? (
                    <DropdownItem
                      key="logout"
                      onClick={async (evt: React.MouseEvent) => {
                        evt.preventDefault();
                        try {
                          await dispatchAuthThunk(thunkLogout());
                        } catch (err) {
                          const errObj = err as Error;
                          toast(errObj.message, {
                            type: 'error',
                          });
                        }
                      }}
                    >
                      Logout
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </UncontrolledDropdown>
              {!loggedIn
                ? [
                    <NavLink
                      className="navbar-link"
                      tag={Link}
                      key="sign-up"
                      to="/signup"
                    >
                      <FormattedMessage id="sign up">
                        {(messages: string[]) => (
                          <>
                            {capitalizeFirstLetter(messages[0])}
                            {'  >'}
                          </>
                        )}
                      </FormattedMessage>
                    </NavLink>,
                    <NavLink
                      className="navbar-link"
                      tag={Link}
                      to="/login"
                      key="login"
                    >
                      <FormattedMessage id="login">
                        {(messages: string[]) => (
                          <>
                            {capitalizeFirstLetter(messages[0])}
                            {'  >'}
                          </>
                        )}
                      </FormattedMessage>
                    </NavLink>,
                  ]
                : null}
            </Nav>
          </Collapse>
        </Navbar>
      </Container>
    </div>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: 'reScribe',
};

export default Header;
