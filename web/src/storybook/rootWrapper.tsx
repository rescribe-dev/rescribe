import { MockedProvider } from '@apollo/client/testing';
import React, { useState } from 'react';
import { WrapRedux } from 'state/reduxWrapper';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import messages from 'locale/common/en';
import { lightThemeClass } from 'utils/theme';

interface input {
  element: JSX.Element;
}

export const wrapRootElement = ({ element }: input): JSX.Element => {
  const [themeClass] = useState<string>(lightThemeClass);
  return (
    <>
      <WrapRedux>
        <MockedProvider>
          <HelmetProvider>
            <IntlProvider locale={'en'} messages={messages}>
              <div id="theme" className={themeClass}>
                {element}
              </div>
            </IntlProvider>
          </HelmetProvider>
        </MockedProvider>
      </WrapRedux>
    </>
  );
};
