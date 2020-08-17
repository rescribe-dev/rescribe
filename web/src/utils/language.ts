import { useStaticQuery, graphql } from 'gatsby';
import { isSSR } from './checkSSR';

interface SiteData {
  site: {
    siteMetadata: {
      languages: {
        default: string;
        options: string[];
      };
    };
  };
}

const getCurrentLanguage = (): string => {
  const data: SiteData = useStaticQuery(graphql`
    query SiteLanguageQuery {
      site {
        siteMetadata {
          languages {
            default
            options
          }
        }
      }
    }
  `);
  const defaultLanguage = data.site.siteMetadata.languages.default;
  const options = data.site.siteMetadata.languages.options;
  let currentLanguage = defaultLanguage;
  if (!isSSR) {
    const url = window.location.pathname;
    const splitURL = url.split('/');
    if (splitURL.length >= 2) {
      const urlLanguage = splitURL[1];
      if (options.includes(urlLanguage)) {
        currentLanguage = urlLanguage;
      }
    }
  }

  return currentLanguage;
};

export default getCurrentLanguage;
