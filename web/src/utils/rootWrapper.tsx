import { WrapApollo } from './apollo';
import { WrapRedux } from '../state/reduxWrapper';

export const wrapRootElement = ({ element }: any) => {
  return WrapRedux(WrapApollo(element));
};
