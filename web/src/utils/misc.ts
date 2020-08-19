import { isSSR } from './checkSSR';
import { ApolloError } from '@apollo/react-hooks';

export const capitalizeOnlyFirstLetter = (elem: string): string => {
  return elem.charAt(0).toUpperCase() + elem.slice(1);
};

export const capitalizeFirstLetter = (elem: string): string => {
  return elem.split(' ').map(capitalizeOnlyFirstLetter).join(' ');
};

export const getBaseURL = (): string => {
  return isSSR ? '' : `${window.location.protocol}//${window.location.host}`;
};

export const propertyOf = <TObj>(name: string): keyof TObj =>
  name as keyof TObj;

export const getErrorCode = (err: ApolloError): number | null => {
  if (err.graphQLErrors.length > 0) {
    const graphqlError = err.graphQLErrors[0];
    if ('code' in graphqlError) {
      const errorCodeObj = new Number(graphqlError['code']);
      if (errorCodeObj) {
        const errorCode = errorCodeObj.valueOf();
        return errorCode;
      }
    }
  }
  return null;
};
