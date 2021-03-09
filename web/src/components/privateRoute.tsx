import { navigate } from 'gatsby';
import { isLoggedIn } from 'state/auth/getters';
import React, { useState, ReactNode, useEffect } from 'react';
import { isSSR } from 'utils/checkSSR';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { WindowLocation } from '@reach/router';

const checkAuthInterval = 5; // check every few minutes

interface PrivateRouteData {
  children?: ReactNode;
  location: WindowLocation;
}

const PrivateRoute = (args: PrivateRouteData): JSX.Element => {
  const [isLoading, setLoading] = useState(true);

  const getRedirect = (): string =>
    `?redirect=${encodeURIComponent(
      args.location.pathname + args.location.search
    )}`;
  const checkLoggedIn = async (): Promise<boolean> => {
    try {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate('/login' + getRedirect());
      }
      return loggedIn;
    } catch (_err) {
      // handle error
      navigate('/login' + getRedirect());
      return false;
    }
  };

  const [checkInterval, setCheckInterval] = useState<
    ReturnType<typeof setInterval> | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      // trigger check to see if user is logged in
      if (await checkLoggedIn()) {
        setLoading(false);
      }
    })();
    setCheckInterval(
      setInterval(async () => {
        await checkLoggedIn();
      }, checkAuthInterval * 60 * 1000)
    );
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  const currentlyLoggedIn = isSSR
    ? undefined
    : useSelector<RootState, boolean | undefined>(
        (state) => state.authReducer.loggedIn
      );
  useEffect(() => {
    if (!currentlyLoggedIn) {
      setLoading(true);
      navigate('/login' + getRedirect());
    }
  }, [currentlyLoggedIn]);

  return <>{isLoading ? null : args.children}</>;
};

export default PrivateRoute;
