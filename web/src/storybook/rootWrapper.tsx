import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { WrapRedux } from 'state/reduxWrapper';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import messages from 'locale/common/en';
import { themeMap, Theme } from 'utils/theme';
import { defaultLanguage } from 'shared/languages';
import { select } from '@storybook/addon-knobs';

interface input {
  element: JSX.Element;
}

export const wrapRootElement = ({ element }: input): JSX.Element => {
  const themeOptions: Theme[] = Object.keys(Theme).map(
    (theme) => Theme[theme as keyof typeof Theme]
  );
  const currentTheme = select<Theme>(
    'global theme',
    themeOptions,
    themeOptions[0]
  );
  return (
    <>
      <WrapRedux>
        <MockedProvider>
          <HelmetProvider>
            <IntlProvider
              locale={defaultLanguage}
              messages={(messages as unknown) as Record<string, string>}
            >
              <div className={currentTheme ? themeMap[currentTheme] : ''}>
                {element}
              </div>
            </IntlProvider>
          </HelmetProvider>
        </MockedProvider>
      </WrapRedux>
    </>
  );
};
