import { navigate } from 'gatsby';
import React from 'react';
import { isInProject } from '../state/project/getters';

const WrapProject = (element: JSX.Element) => {
  if (!isInProject()) {
    navigate('/app/account');
    return null;
  }
  return <>{element}</>;
};

export default WrapProject;
