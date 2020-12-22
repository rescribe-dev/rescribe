import React, { useState } from 'react';
import {
  Col,
  Container,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
} from 'reactstrap';
import './index.scss';
import Description from './description';
import { WindowLocation } from '@reach/router';
import ExploreResultComponent from './exploreResult';

// export interface ExplorePageProps extends PageProps {
//   data: Record<string, unknown>;
// }
/* For these args, we are going to need 
  - repositoryName
  - repostoryCode
  - repositoryLanguage
  - repositoryDescription
*/
interface ExplorePageContentProps {
  results: JSX.Element[];
  location: WindowLocation;
}

const ExplorePage = (_args: ExplorePageContentProps): JSX.Element => {
  // Dummy variable, set to some client query with useState
  const results = [
    {
      repoUrl: 'jschmidtnj/rescribe/api/login.go',
      repoCode:
        'async create() \n{\n\tawait dataBase.crateUser({name: "hello"})\n}',
      repoName: 'reScribe',
      repoLang: 'TypeScript',
      repoDes:
        'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
      selected: true,
    },
    {
      repoUrl: 'jschmidtnj/rescribe/api/login.go',
      repoCode: "console.log('hello')",
      repoName: 'reScribe',
      repoLang: 'TypeScript',
      repoDes:
        'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
      selected: false,
    },
  ];
  const resultsPerPage = 5;
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const [currentPage, setcurrentPage] = useState(1);
  return (
    <>
      <Container
        style={{
          background: 'var(--purple-blue)',
          clipPath: 'polygon(0% 0%, 0% 89%, 54% 0%)',
        }}
      >
        <>
          <Col>
            <>
              <Row>
                <Col sm="7">
                  <h5
                    style={{
                      fontFamily: 'NotoSans, sans-serif',
                      fontWeight: 550,
                      color: 'white',
                      textAlign: 'center',
                      marginTop: '140px',
                    }}
                  >
                    Popular Results
                  </h5>
                </Col>
              </Row>
              {results.map((res) => {
                return (
                  <Row key={res.repoUrl}>
                    <Col sm="7">
                      <ExploreResultComponent
                        repoUrl={res.repoUrl}
                        repoCode={res.repoCode}
                        repoName={res.repoCode}
                        repoDes={res.repoDes}
                        repoLang={res.repoLang}
                        selected={res.selected}
                      />
                    </Col>
                    <Col sm="5">
                      {res.selected && (
                        <Description
                          repo={res.repoUrl}
                          desc={'asdflkdsaf;ljkfd  lkasdjkfsdlk asdflkasjkl'}
                        />
                      )}
                    </Col>
                  </Row>
                );
              })}
              <Pagination aria-label="Explore Navigation">
                <PaginationItem>
                  <PaginationLink first href="explore/1" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      if (currentPage > 1) {
                        setcurrentPage(currentPage - 1);
                      }
                    }}
                    previous
                    href={'explore/' + currentPage}
                  />
                </PaginationItem>
                {[...Array(totalPages).keys()].map((pageNumber) => {
                  return (
                    <PaginationItem key={pageNumber + 1}>
                      <PaginationLink
                        onClick={() => {
                          setcurrentPage(pageNumber + 1);
                        }}
                        href={'explore/' + (pageNumber + 1)}
                      >
                        {pageNumber + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setcurrentPage(currentPage + 1);
                      }
                    }}
                    next
                    href={'explore/' + currentPage}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink last href={'explore/' + totalPages} />
                </PaginationItem>
              </Pagination>
            </>
          </Col>
        </>
      </Container>
    </>
  );
};

export default ExplorePage;
