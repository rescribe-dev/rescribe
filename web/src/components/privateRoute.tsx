import { navigate, PageProps } from 'gatsby';
import { isLoggedIn } from '../state/auth/getters';
import React, { useState } from 'react';

interface Input extends PageProps {
  component: (args: PageProps) => JSX.Element;
}

const PrivateRoute = (args: Input) => {
  const [isLoading, setLoading] = useState(true);
  const pageArgs: PageProps = args;
  const childComponent = args.component(pageArgs);
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
  return <>{isLoading ? null : childComponent}</>;
};

export default PrivateRoute;
