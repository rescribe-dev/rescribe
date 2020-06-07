import React from 'react';
import PropTypes from 'prop-types';
import Loadable from '@loadable/component';
import Helmet from 'react-helmet';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStaticQuery, graphql } from 'gatsby';

import Header from '../components/header';
import Footer from '../components/footer';

import './index.scss';
import { WindowLocation } from '@reach/router';

toast.configure({
  autoClose: 4000,
  draggable: false,
  newestOnTop: true,
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
});

const Fonts = Loadable(() => import('../components/fontloader'));

interface LayoutArgs {
  children: any;
  location: WindowLocation;
}

interface IndexLayoutProps {
  site: {
    siteMetadata: {
      title: string;
    };
  };
}

const Layout = (args: LayoutArgs) => {
  const data: IndexLayoutProps = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <>
      <Helmet>
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.GATSBY_RECAPTCHA_SITE_KEY}`}
        ></script>
      </Helmet>
      <Fonts />
      <div className="main-wrapper">
        <Header
          siteTitle={data.site.siteMetadata.title}
          location={args.location}
        />
        <main className="content">{args.children}</main>
        <Footer />
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
