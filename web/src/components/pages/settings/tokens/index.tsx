import React, { useEffect, useState } from 'react';
import { Container, Button, Table, Row, Col } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';
import { ApolloQueryResult } from 'apollo-client';

import './index.scss';
import { TokensMessages } from 'locale/pages/settings/tokens/tokensMessages';
import { client } from 'utils/apollo';
import {
  TokensQuery,
  TokensQueryVariables,
  Tokens,
  DeleteTokenMutation,
  DeleteTokenMutationVariables,
  DeleteToken,
} from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';
import { toast } from 'react-toastify';
import { AiFillDelete } from 'react-icons/ai';
import { useMutation } from '@apollo/react-hooks';
import DeleteTokenModal from './modals/DeleteTokenModal';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TokensPageDataProps extends PageProps {}

interface TokensProps extends TokensPageDataProps {
  messages: TokensMessages;
}

const TokensPage = (_args: TokensProps): JSX.Element => {
  const [currentToken, setCurrentToken] = useState<ObjectId | undefined>(
    undefined
  );
  const [tokens, setTokens] = useState<
    ApolloQueryResult<TokensQuery> | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      try {
        const tokensRes = await client.query<TokensQuery, TokensQueryVariables>(
          {
            query: Tokens,
            variables: {},
            fetchPolicy: 'network-only',
          }
        );
        tokensRes.data.tokens.map((token) => {
          token._id = new ObjectId(token._id);
        });
        setTokens(tokensRes);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);

  const [deleteTokenModalIsOpen, setDeleteTokenModalIsOpen] = useState(false);
  const deleteTokenModalToggle = () =>
    setDeleteTokenModalIsOpen(!deleteTokenModalIsOpen);
  const [deleteTokenMutation] = useMutation<
    DeleteTokenMutation,
    DeleteTokenMutationVariables
  >(DeleteToken);

  return (
    <>
      {!tokens || tokens.loading ? (
        <p>loading...</p>
      ) : (
        <>
          <Container>
            {tokens.data.tokens.length === 0 ? (
              <p>no tokens found</p>
            ) : (
              <>
                <Table>
                  <thead>
                    <tr>
                      <th>Tokens:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.data.tokens.map((token) => (
                      <tr
                        key={`token-${(token._id as ObjectId).toHexString()}`}
                      >
                        <td>
                          <Row>
                            <Col>{token.notes}</Col>
                            <Col>
                              <Button
                                style={{
                                  color: '#818A91',
                                  backgroundColor: '#fff',
                                  border: '0px',
                                }}
                                onClick={(evt) => {
                                  evt.preventDefault();
                                  setCurrentToken(token._id);
                                  deleteTokenModalToggle();
                                }}
                              >
                                <AiFillDelete />
                              </Button>
                            </Col>
                          </Row>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button
                  onClick={(evt) => {
                    evt.preventDefault();
                    navigate('/settings/tokens/new');
                  }}
                >
                  New
                </Button>
              </>
            )}
          </Container>
          <DeleteTokenModal
            isOpen={deleteTokenModalIsOpen}
            toggle={deleteTokenModalToggle}
            deleteToken={async (): Promise<void> => {
              if (!currentToken) return;
              await deleteTokenMutation({
                variables: {
                  id: currentToken,
                },
                update: () => {
                  setTokens({
                    ...tokens,
                    loading: false,
                    data: {
                      tokens: tokens.data.tokens.filter(
                        (elem) => !(elem._id as ObjectId).equals(currentToken)
                      ),
                    },
                  });
                },
              });
            }}
          />
        </>
      )}
    </>
  );
};

export default TokensPage;
