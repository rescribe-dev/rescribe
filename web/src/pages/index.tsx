import React from 'react';
import { Container } from 'reactstrap';

import Layout from '../layouts/index';
import SEO from '../components/seo';
import './index.scss';
import gql from 'graphql-tag';
import { isSSR } from '../utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';

const hello = gql`
  query hello {
    hello
  }
`;

interface HelloRes {
  hello: string;
}

interface IndexPageProps {
  data: {};
}

const IndexPage = (_args: IndexPageProps) => {
  if (!isSSR) {
    console.log(useQuery<HelloRes | undefined>(hello).data?.hello);
  }
  return (
    <Layout>
      <SEO title="Rescribe" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      ></Container>
    </Layout>
  );
};

export default IndexPage;
