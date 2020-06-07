import React from 'react';
import WebFont from 'webfontloader';

const FontLoader = () => {
  WebFont.load({
    google: {
      families: ['Noto+Sans', 'Inconsolata'],
    },
  });
  return <></>;
};

export default FontLoader;
