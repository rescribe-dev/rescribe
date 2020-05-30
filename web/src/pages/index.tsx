import React from 'react';
import { Container } from 'reactstrap';
import SearchBar from '../components/index/SearchBar';
import Layout from '../layouts/index';
import SEO from '../components/seo';
import './index.scss';
import { isSSR } from '../utils/checkSSR';
import { useQuery } from '@apollo/react-hooks';
import { HelloQuery, Hello } from '../lib/generated/datamodel';

interface IndexPageProps {
  data: {};
}

const IndexPage = (_args: IndexPageProps) => {
  if (!isSSR) {
    console.log(useQuery<HelloQuery | undefined>(Hello).data?.hello);
  }
  return (
    <Layout>
      <SEO title="Rescribe" />
      <Container
        style={{
          marginTop: '3rem',
          marginBottom: '5rem',
        }}
      >
        <SearchBar />
      </Container>
    </Layout>
  );
};

export default IndexPage;
