import React from 'react';
import { Link, PageProps } from 'gatsby';
import { ErrorMessages } from 'locale/pages/404/errorMessages';

import './index.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ErrorPageDataProps extends PageProps {}

interface ErrorProps extends ErrorPageDataProps {
  messages: ErrorMessages;
}

const NotFoundPage = (_args: ErrorProps): JSX.Element => (
  <>
    <h1>NOT FOUND</h1>
    <p>The page you were looking for was not found.</p>
    <Link to="/">Go home</Link>
  </>
);

export default NotFoundPage;
