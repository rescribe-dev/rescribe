require('dotenv').config();

const fullURL = `http${process.env.USE_SECURE === 'true' ? 's' : ''}://${
  process.env.CURRENT_URL
}`;

module.exports = {
  title: 'reScribe Docs',
  tagline: 'code search engine',
  url: fullURL,
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'rescribe', // Usually your GitHub org/user name.
  projectName: 'rescribe', // Usually your repo name.
  plugins: ['docusaurus2-dotenv'],
  themeConfig: {
    navbar: {
      title: '',
      logo: {
        alt: 'reScribe Docs',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          to: 'playground',
          activeBasePath: 'playground',
          label: 'Playground',
          position: 'left',
        },
        {
          href: 'https://github.com/rescribe-dev/rescribe',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/getting_started/index',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/rescribe',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/rescribe',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/rescribe',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog/',
            },
            {
              href: `${fullURL}/storybook/index.html`,
              label: 'Storybook',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/rescribe-dev/rescribe',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} reScribe`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/rescribe-dev/rescribe/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/rescribe-dev/rescribe/edit/main/docs/blog/',
        },
        theme: [
          'theme-blog-bootstrap',
          {
            customCss: require.resolve('./src/css/custom.css'),
          },
        ],
      },
    ],
  ],
};
