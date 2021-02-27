import React from 'react';
import { Container } from 'reactstrap';

import './index.scss';

const Footer = (): JSX.Element => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-footer)',
        paddingTop: '2rem',
      }}
    >
      <Container>
        <p>© {new Date().getFullYear()}, reScribe</p>
      </Container>
    </footer>
  );
};

export default Footer;
