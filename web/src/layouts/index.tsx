import React from 'react';
import Layout, { BaseLayoutArgs } from './main';

import messages from 'locale/common/en';

const englishLayout = (args: BaseLayoutArgs): JSX.Element => (
  <Layout {...args} i18nMessages={messages}>
    <>{args.children}</>
  </Layout>
);

export default englishLayout;
