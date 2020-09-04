import React, { useEffect } from 'react';

import { navigate } from '@reach/router';
import { PageProps } from 'gatsby';

const AccountPage = (_args: PageProps): JSX.Element => {
  useEffect(() => {
    navigate('/settings');
  }, []);
  return <>{null}</>;
};

export default AccountPage;
