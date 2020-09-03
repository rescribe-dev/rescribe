import React from 'react';
import { Container } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';
import { NewMessages } from 'locale/pages/settings/tokens/new/newMessages';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NewPageDataProps extends PageProps {}

interface NewProps extends NewPageDataProps {
  messages: NewMessages;
}
const NewPage = (_args: NewProps): JSX.Element => {
  return (
    <Container>
      <div>new token page</div>
    </Container>
  );
};

export default NewPage;
