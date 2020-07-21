import React from 'react';
import Layout from '@theme/Layout';
import GraphiQL from 'graphiql';

import 'graphiql/graphiql.min.css';
import './index.css';

const useSecure = process.env.USE_SECURE === 'true';
const apiURL = `http${useSecure ? 's' : ''}://${process.env.API_URL}/graphql`;

const graphQLFetcher = async (graphQLParams) => {
  const response = await fetch(apiURL, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
  });
  return await response.json();
};

const Playground = () => {
  return (
    <Layout title="Playground" description="rescribe api playground">
      <GraphiQL fetcher={graphQLFetcher} />
    </Layout>
  );
};

export default Playground;
