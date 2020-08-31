import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import './index.css';

const features = [
  {
    title: <>Easy to Use</>,
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: <>reScribe was designed to make it easy to index your code.</>,
  },
  {
    title: <>Increases Development Speed</>,
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>reScribe lets you find the code you need, making development faster.</>
    ),
  },
  {
    title: <>Easily Extendible</>,
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Build custom extensions and implementations, using reScribe&apos;s
        intuitive graphql api.
      </>
    ),
  },
];

const Feature = ({ imageUrl, title, description }) => {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4')}>
      {imgUrl && (
        <div className="text--center">
          <img className="feature-image" src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const Home = () => {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title="Home" description="rescribe docs home page">
      <header className={classnames('hero hero--primary', 'heroBanner')}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className="buttons">
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg'
              )}
              to={useBaseUrl('docs/getting_started/index')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className="features">
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
};

export default Home;
