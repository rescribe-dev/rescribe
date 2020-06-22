import React from 'react';
import WebFont from 'webfontloader';
import { isSSR } from '../utils/checkSSR';

const FontLoader = () => {
  if (!isSSR) {
    WebFont.load({
      google: {
        families: ['Noto+Sans', 'Inconsolata'],
      },
    });
  }
  return <></>;
};

export default FontLoader;
