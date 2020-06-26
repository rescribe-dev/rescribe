import { WrapApollo } from './apollo';
import { WrapRedux } from '../state/reduxWrapper';

interface input {
  element: JSX.Element;
}

export const wrapRootElement = ({ element }: input): JSX.Element => {
  return WrapRedux(WrapApollo(element));
};
