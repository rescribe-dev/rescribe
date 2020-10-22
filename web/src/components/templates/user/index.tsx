import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Row } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';

import './index.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { isSSR } from 'utils/checkSSR';
import {
  UserFieldsFragment,
  PublicUser,
  PublicUserQuery,
  PublicUserFieldsFragment,
  PublicUserQueryVariables,
} from 'lib/generated/datamodel';
import { client } from 'utils/apollo';
import { UserMessages } from 'locale/templates/user/userMessages';
import { ApolloError } from 'apollo-client';
import { getErrorCode } from 'utils/misc';
import { toast } from 'react-toastify';
import statusCodes from 'http-status-codes';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserPageDataProps extends PageProps {}

interface UserProps extends UserPageDataProps {
  messages: UserMessages;
}

const UserPage = (args: UserProps): JSX.Element => {
  const splitPath = args.location.pathname.split('/');
  let username: string | undefined = undefined;
  if (splitPath.length === 2) {
    username = splitPath[1];
  } else if (splitPath.length === 3) {
    username = splitPath[2];
  }
  const currentUser = isSSR
    ? undefined
    : useSelector<RootState, UserFieldsFragment | undefined>(
        (state) => state.authReducer.user
      );
  const [user, setUser] = useState<PublicUserFieldsFragment | undefined>(
    undefined
  );
  useEffect(() => {
    if (currentUser && username === currentUser.username) {
      setUser(currentUser as PublicUserFieldsFragment);
    } else if (!isSSR) {
      client
        .query<PublicUserQuery | undefined, PublicUserQueryVariables>({
          query: PublicUser,
          variables: {
            username: username as string,
          },
          fetchPolicy: 'no-cache', // disable cache
        })
        .then((res) => setUser(res.data?.publicUser))
        .catch((err: ApolloError) => {
          const errorCode = getErrorCode(err);
          if (errorCode === statusCodes.NOT_FOUND) {
            navigate('/404', {
              state: {
                location: window.location.href,
              },
            });
          } else {
            toast(err.message, {
              type: 'error',
            });
          }
        });
    }
  }, []);
  return (
    <Container
      style={{
        marginTop: '3rem',
        marginBottom: '2rem',
      }}
    >
      <div>
        {user === undefined ? (
          <div>loading</div>
        ) : (
          <div>
            <Container>
              <Row>
                <Col md="4">
                  <Row className="text-center">
                    <Col>
                      <Container
                        style={{
                          marginBottom: '2rem',
                        }}
                      >
                        <LazyLoadImage
                          src={'https://i.stack.imgur.com/frlIf.png'}
                          style={{
                            borderRadius: '50%',
                          }}
                        />
                      </Container>
                    </Col>
                  </Row>
                  <Row className="text-center">
                    <Col>
                      <Button
                        onClick={(evt) => {
                          evt.preventDefault();
                          navigate('/settings');
                        }}
                        color="secondary"
                      >
                        Change User Profile
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col md="8">
                  {/* <Container
                    style={{
                      marginBottom: '1rem',
                    }}
                  >
                    <Row className="text-center">
                      <Col md="2">
                        <Button
                          onClick={(evt) => {
                            evt.preventDefault();
                            navigate(`/${username}/repositories`);
                          }}
                          color="primary"
                        >
                          Repositories
                        </Button>
                      </Col>
                      <Col md="2">
                        <Button
                          onClick={(evt) => {
                            evt.preventDefault();
                            navigate(`/${username}/projects`);
                          }}
                          color="primary"
                        >
                          Projects
                        </Button>
                      </Col>
                    </Row>
                  </Container> */}

                  <Row>
                    <Container
                      style={{
                        marginLeft: '1rem',
                      }}
                    >
                      <Col md="6">
                        <h5>Previous Searches</h5>
                      </Col>
                    </Container>
                  </Row>
                </Col>
              </Row>
            </Container>
          </div>
        )}
      </div>
    </Container>
  );
};

export default UserPage;
