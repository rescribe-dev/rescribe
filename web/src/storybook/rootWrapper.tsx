import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { WrapRedux } from 'state/reduxWrapper';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import messages from 'locale/common/en';
import { themeMap, Theme } from 'utils/theme';
import { defaultLanguage } from 'utils/languages';

interface input {
  element: JSX.Element;
}

export const wrapRootElement = ({ element }: input): JSX.Element => {
  return (
    <>
      <WrapRedux>
        <MockedProvider>
          <HelmetProvider>
            <IntlProvider
              locale={defaultLanguage}
              messages={(messages as unknown) as Record<string, string>}
            >
              <div id="theme" className={themeMap[Theme.light]}>
                {element}
              </div>
            </IntlProvider>
          </HelmetProvider>
        </MockedProvider>
      </WrapRedux>
    </>
  );
};
