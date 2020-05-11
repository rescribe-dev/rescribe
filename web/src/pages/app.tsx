import React from 'react';
import { Router } from '@reach/router';
import Layout from '../layouts';
import Account from '../components/account';
import PrivateRoute from '../components/privateRoute';
import { PageProps } from 'gatsby';

const App = (args: PageProps) => (
  <Layout>
    <Router>
      <PrivateRoute {...args} path="/app/account" component={Account} />
    </Router>
  </Layout>
);

export default App;
