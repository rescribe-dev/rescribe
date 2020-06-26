import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStaticQuery, graphql } from 'gatsby';
import Loadable from '@loadable/component';

import Header from '../components/header';
import Footer from '../components/footer';

import './index.scss';
import { WindowLocation } from '@reach/router';

const Fonts = Loadable(() => import('../components/fontloader'));

toast.configure({
  autoClose: 4000,
  draggable: false,
  newestOnTop: true,
  position: 'top-right',
  pauseOnFocusLoss: false,
  pauseOnHover: true,
});

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

const Layout = (args: LayoutArgs): JSX.Element => {
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
