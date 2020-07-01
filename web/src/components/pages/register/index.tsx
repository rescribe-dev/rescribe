import React from 'react';
import { Container } from 'reactstrap';
import { PageProps } from 'gatsby';

import './index.scss';
import { RegisterMessages } from 'locale/pages/register/registerMessages';
import SignUpContent from 'components/SignUp';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RegisterPageDataProps extends PageProps {}

interface RegisterProps extends RegisterPageDataProps {
  messages: RegisterMessages;
}

const RegisterPage = (_args: RegisterProps): JSX.Element => {
  return (
    <Container className="mt-4">
      <SignUpContent />
    </Container>
  );
};

export default RegisterPage;
