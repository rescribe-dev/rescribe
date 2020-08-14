import { action } from '@storybook/addon-actions';

import 'assets/styles/global.scss';
import { isSSR } from 'utils/checkSSR';

declare global {
  // eslint-disable-next-line no-var
  var __PATH_PREFIX__: string;
  interface Window {
    ___navigate: any;
  }
}

// eslint-disable-next-line no-undef
globalThis.__PATH_PREFIX__ = '';

if (!isSSR) {
  // window.___push was renamed to window.___navigate, has to do this renaming too or storybook would error on clicking links

  window.___navigate = (pathname: string) => {
    action('NavigateTo:')(pathname);
  };
}
