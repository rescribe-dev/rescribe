import React from 'react';
import { Router } from '@reach/router';
import Layout from '../layouts';
import Account from '../components/account';
import Project from '../components/project';
import PrivateRoute from '../components/privateRoute';
import WrapProject from '../components/projectRoute';
import { PageProps } from 'gatsby';

const App = (args: PageProps) => {
  return (
    <Layout>
      <Router>
        <PrivateRoute {...args} path="/app/account" component={Account} />
        {WrapProject(
          <PrivateRoute {...args} path="/app/project" component={Project} />
        )}
      </Router>
    </Layout>
  );
};

export default App;
