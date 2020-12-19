import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import './index.scss';
import { ExploreResult } from 'locale/pages/explore/exploreMessages';
import Description from './description';
import logoBlack from 'assets/images/logo-black.svg';
import PopRes from './exploreResult';
import { WindowLocation } from '@reach/router';

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
  results: ExploreResult[];
  location: WindowLocation;
}

const ExplorePage = (_args: ExplorePageContentProps): JSX.Element => {
  // Dummy variable, set to some client query with useState
  const results = [
    {
      repoUrl: 'jschmidtnj/rescribe/api/login.go',
      repoCode: '',
      repoName: 'reScribe',
      repoLang: 'TypeScript',
      repoDes:
        'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
      selected: true,
    },
    {
      repoUrl: 'jschmidtnj/rescribe/api/login.go',
      repoCode: '',
      repoName: 'reScribe',
      repoLang: 'TypeScript',
      repoDes:
        'On mobile this will go below the search result, or disappear entirely to be replaced by only the link to the full repository',
      selected: false,
    },
  ];
  return (
    <>
      <Container>
        <>
          <Col>
            <>
              <Row>
                <h3>Popular Results</h3>
              </Row>
              <Row>
                {results.map((result) => {
                  return (
                    <PopRes
                      key={result.repoName}
                      url={result.repoUrl}
                      code={result.repoCode}
                      lang={result.repoLang}
                      selected={result.selected}
                    />
                  );
                })}
              </Row>
            </>
          </Col>
        </>
        <>
          <Col>
            <Row>
              <Description
                repository={'asdf123'}
                source={'https://apple.com'}
                description={'asdflkdsaf;ljkfd  lkasdjkfsdlk asdflkasjkl'}
              />
              {/* 
                Insert the Description component for the code snippet, this will probably amount to a segment
                from the readme when we get it, but for now we just just have it be the link to the source of the selected code
              */}
            </Row>
            <Row>
              <Col className="text-center">
                <img
                  src={logoBlack}
                  alt="reScribe"
                  style={{
                    width: '9rem',
                    marginBottom: 0,
                  }}
                />
              </Col>
            </Row>
          </Col>
        </>
      </Container>
    </>
  );
};

export default ExplorePage;
