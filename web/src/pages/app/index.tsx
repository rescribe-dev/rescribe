import React from 'react';
import { Router } from '@reach/router';
import Layout from '../../layouts';
import Account from '../../components/account';
import Project from '../../components/project';
import PrivateRoute from '../../components/privateRoute';
import { PageProps } from 'gatsby';

import './index.scss';

const App = (args: PageProps) => {
  return (
    <Layout>
      <Router>
        <PrivateRoute {...args} path="/app/account" component={Account} />
        <PrivateRoute {...args} path="/app/project" component={Project} />
      </Router>
    </Layout>
  );
};

export default App;
