import { action } from '@storybook/addon-actions';

import '../assets/styles/global.scss';

// window.___push was renamed to window.___navigate, has to do this renaming too or storybook would error on clicking links
declare global {
  // eslint-disable-next-line no-var
  var __PATH_PREFIX__: string;
  interface Window {
    ___navigate: any;
  }
}

// eslint-disable-next-line no-undef
globalThis.__PATH_PREFIX__ = '';

window.___navigate = (pathname: string) => {
  action('NavigateTo:')(pathname);
};
