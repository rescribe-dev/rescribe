import React from 'react';
import { Container } from 'reactstrap';
import './index.scss';
// import NavCard from 'components/pages/NaviagtionCard';
import { PageProps } from 'gatsby';
import { ExploreMessages } from 'locale/pages/explore/exploreMessages';

export interface ExplorePageProps extends PageProps {
  data: Record<string, unknown>;
}

interface ExplorePageContentProps extends ExplorePageProps {
  messages: ExploreMessages;
}

const ExplorePage = (_args: ExplorePageContentProps): JSX.Element => {
  return (
    <>
      <Container>
        <p>explore page</p>
      </Container>
    </>
  );
};

export default ExplorePage;
