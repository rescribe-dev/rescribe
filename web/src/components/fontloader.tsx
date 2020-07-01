import React, { useEffect } from 'react';
// this uses window
import WebFont from 'webfontloader';

const FontLoader = (): JSX.Element => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Noto+Sans:wght@400;700', 'Inconsolata'],
      },
    });
  });
  return <></>;
};

export default FontLoader;
