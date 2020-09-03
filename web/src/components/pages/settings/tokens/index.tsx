import React from 'react';
import { Container, Button } from 'reactstrap';
import { PageProps, navigate } from 'gatsby';

import './index.scss';
import { TokensMessages } from 'locale/pages/settings/tokens/tokensMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TokensPageDataProps extends PageProps {}

interface TokensProps extends TokensPageDataProps {
  messages: TokensMessages;
}
const TokensPage = (_args: TokensProps): JSX.Element => {
  return (
    <Container>
      <div>tokens page</div>
      <Button onClick={(evt) => {
          evt.preventDefault();
          navigate('/settings/tokens/new');
        }}>
          New
        </Button>
    </Container>
  );
};

export default TokensPage;
