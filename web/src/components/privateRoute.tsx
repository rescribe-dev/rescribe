import { navigate } from 'gatsby';
import { isLoggedIn } from 'state/auth/getters';
import React, { useState, ReactNode, useEffect } from 'react';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { WindowLocation } from '@reach/router';

interface PrivateRouteData {
  children?: ReactNode;
  location: WindowLocation;
}

const PrivateRoute = (args: PrivateRouteData): JSX.Element => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      // trigger check to see if user is logged in
      const currentPath = args.location.pathname + args.location.search;
      const redirectParams = `?redirect=${encodeURIComponent(currentPath)}`;
      try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
          navigate('/login' + redirectParams);
        } else {
          setLoading(false);
        }
      } catch (_err) {
        // handle error
        navigate('/login' + redirectParams);
      }
    })();
  }, []);
  const currentlyLoggedIn = isSSR
    ? undefined
    : useSelector<RootState, boolean | undefined>(
        (state) => state.authReducer.loggedIn
      );
  useEffect(() => {
    if (!currentlyLoggedIn) {
      setLoading(true);
      navigate('/login');
    }
  }, [currentlyLoggedIn]);
  return <>{isLoading ? null : args.children}</>;
};

export default PrivateRoute;
