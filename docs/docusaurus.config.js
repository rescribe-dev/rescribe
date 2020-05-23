module.exports = {
  title: 'Rescribe Docs',
  tagline: 'code search engine',
  url: 'https://mdigreg2.github.io',
  baseUrl: '/rescribe/',
  favicon: 'img/favicon.ico',
  organizationName: 'rescribe', // Usually your GitHub org/user name.
  projectName: 'rescribe', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Rescribe Docs',
      logo: {
        alt: 'Rescribe Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/mdigreg2/rescribe',
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
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
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
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/mdigreg2/rescribe',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Rescribe`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/mdigreg2/rescribe/edit/master/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/mdigreg2/rescribe/edit/master/docs/blog/',
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
