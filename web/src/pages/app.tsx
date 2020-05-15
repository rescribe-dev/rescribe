import React from 'react';
import { Router } from '@reach/router';
import Layout from '../layouts';
import Account from '../components/account';
import Project from '../components/project';
import Search from '../components/search';
import PrivateRoute from '../components/privateRoute';
import { PageProps } from 'gatsby';

const App = (args: PageProps) => {
  return (
    <Layout>
      <Router>
        <PrivateRoute {...args} path="/app/account" component={Account} />
        <PrivateRoute
          {...args}
          path="/app/project"
          requiresProject={true}
          component={Project}
        />
        <PrivateRoute
          {...args}
          path="/app/search"
          requiresProject={true}
          component={Search}
        />
      </Router>
    </Layout>
  );
};

export default App;
