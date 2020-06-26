import React, { useEffect } from 'react';
// this uses window
import WebFont from 'webfontloader';

const FontLoader = (): JSX.Element => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Noto+Sans', 'Inconsolata'],
      },
    });
  });
  return <></>;
};

export default FontLoader;
