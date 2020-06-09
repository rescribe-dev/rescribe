import React from 'react';
import { Container } from 'reactstrap';

import './index.scss';

const Footer = () => {
  return (
    <footer>
      <Container>
        <p>© {new Date().getFullYear()}, Rescribe</p>
      </Container>
    </footer>
  );
};

export default Footer;
