import React, { ReactNode, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStaticQuery, graphql } from 'gatsby';
import Loadable from '@loadable/component';
import { HelmetProvider } from 'react-helmet-async';

import Header from 'components/header';
import Footer from 'components/footer';

import { IntlProvider } from 'react-intl';

import './index.scss';
import { WindowLocation } from '@reach/router';
import { isSSR } from 'utils/checkSSR';

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
const lightThemeClass = 'light';
export const darkThemeClass = 'dark';

const Layout = (args: IndexLayoutArgs): JSX.Element => {
  const data: IndexLayoutProps = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          languages {
            default
            options
          }
        }
      }
    }
  `);

  const [themeClass] = useState<string>(lightThemeClass);

  let currentLanguage = data.site.siteMetadata.languages.default;
  if (!isSSR) {
    const url = window.location.pathname;
    const splitURL = url.split('/');
    if (splitURL.length >= 2) {
      const urlLanguage = splitURL[1];
      if (data.site.siteMetadata.languages.options.includes(urlLanguage)) {
        currentLanguage = urlLanguage;
      }
    }
  }

  return (
    <HelmetProvider>
      <IntlProvider locale={currentLanguage} messages={args.i18nMessages}>
        <Fonts />
        <div className={`main-wrapper ${themeClass}`}>
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
