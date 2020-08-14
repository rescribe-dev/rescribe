import { action } from '@storybook/addon-actions';
import 'assets/styles/global.scss';

declare global {
  // eslint-disable-next-line no-var
  var __PATH_PREFIX__: string;
  interface Window {
    ___navigate: any;
  }

  // eslint-disable-next-line no-var
  var ___loader: any;
}

// eslint-disable-next-line no-undef
globalThis.__PATH_PREFIX__ = '';

// window.___push was renamed to window.___navigate, has to do this renaming too or storybook would error on clicking links

window.___navigate = (pathname: string) => {
  action('NavigateTo:')(pathname);
};

// Gatsby's Link overrides:
// Gatsby Link calls the `enqueue` & `hovering` methods on the global variable ___loader.
// This global object isn't set in storybook context, requiring you to override it to empty functions (no-op),
// so Gatsby Link doesn't throw any errors.
global.___loader = {
  enqueue: () => {
    // do nothing
  },
  hovering: () => {
    // do nothing
  },
};
