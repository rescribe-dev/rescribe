import { WrapApollo } from './apollo';
import { WrapRedux } from 'state/reduxWrapper';
import React from 'react';

interface input {
  element: any;
}

export const wrapRootElement = ({ element }: input): JSX.Element => {
  return (
    <WrapRedux>
      <WrapApollo>{element}</WrapApollo>
    </WrapRedux>
  );
};
