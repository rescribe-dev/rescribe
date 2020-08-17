import { isSSR } from './checkSSR';

export const capitalizeFirstLetter = (elem: string): string => {
  return elem
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const capitalizeOnlyFirstLetter = (elem: string): string => {
  return elem.charAt(0).toUpperCase() + elem.slice(1);
};

export const getBaseURL = (): string => {
  return isSSR ? '' : `${window.location.protocol}//${window.location.host}`;
};
