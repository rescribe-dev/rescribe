import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStaticQuery, graphql } from 'gatsby';
import Loadable from '@loadable/component';
import { HelmetProvider } from 'react-helmet-async';

import Header from 'components/Header';
import Footer from 'components/Footer';

import { IntlProvider } from 'react-intl';

import './index.scss';
import { WindowLocation } from '@reach/router';
import { isSSR } from 'utils/checkSSR';
import { themeMap } from 'utils/theme';
import { useSelector } from 'react-redux';
import { RootState } from 'state';
import { Theme } from 'utils/theme';
import getCurrentLanguageFromURL from 'utils/getCurrentLanguageFromURL';

const Fonts = Loadable(() => import('components/fontloader'));

toast.configure({
  autoClose: 4000,
  draggable: false,
  newestOnTop: true,
  position: 'top-right',
  pauseOnFocusLoss: false,
  pauseOnHover: true,
});

export interface BaseLayoutArgs {
  children: ReactNode;
  location: WindowLocation;
}

interface IndexLayoutArgs extends BaseLayoutArgs {
  i18nMessages: Record<string, string>;
}

interface IndexLayoutProps {
  site: {
    siteMetadata: {
      title: string;
      languages: {
        default: string;
        options: string[];
      };
    };
  };
}

// TODO - create a switcher between themes

const Layout = (args: IndexLayoutArgs): JSX.Element => {
  const data: IndexLayoutProps = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const currentTheme = isSSR
    ? undefined
    : useSelector<RootState, Theme | undefined>(
        (state) => state.settingsReducer.theme
      );

  const currentLanguage = getCurrentLanguageFromURL();

  return (
    <HelmetProvider>
      <IntlProvider locale={currentLanguage} messages={args.i18nMessages}>
        <Fonts />
        <div
          className={`main-wrapper ${
            currentTheme ? themeMap[currentTheme] : ''
          }`}
        >
          <Header
            siteTitle={data.site.siteMetadata.title}
            location={args.location}
          />
          <main className="content">{args.children}</main>
          <Footer />
        </div>
      </IntlProvider>
    </HelmetProvider>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
