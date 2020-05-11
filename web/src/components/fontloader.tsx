import React from 'react';
import WebFont from 'webfontloader';

class FontLoader extends React.Component {
  componentDidMount() {
    WebFont.load({
      google: {
        families: ['Montserrat'],
      },
    });
  }
  render() {
    return <></>;
  }
}

export default FontLoader;
