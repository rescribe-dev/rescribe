import { navigate } from 'gatsby';
import { isLoggedIn } from '../state/auth/getters';
import React, { useState, ReactNode } from 'react';

interface PrivateRouteData {
  children?: ReactNode;
}

const PrivateRoute = (args: PrivateRouteData) => {
  const [isLoading, setLoading] = useState(true);
  isLoggedIn()
    .then((loggedIn) => {
      if (!loggedIn) {
        navigate('/login');
      } else {
        setLoading(false);
      }
    })
    .catch((_err) => {
      navigate('/login');
    });
  return <>{isLoading ? null : args.children}</>;
};

export default PrivateRoute;
