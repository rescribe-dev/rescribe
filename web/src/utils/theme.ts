export enum Theme {
  light = 'light',
  dark = 'dark',
}

export const themeMap: Record<Theme, string> = {
  [Theme.light]: 'light',
  [Theme.dark]: 'dark',
};

export const darkThemes: Theme[] = [Theme.dark];
