import Typography from 'typography';

// see https://github.com/KyleAMathews/typography.js/blob/master/packages/typography-theme-alton/src/index.js

const typography = new Typography({
  baseFontSize: '16px',
  baseLineHeight: 1.666,
  headerFontFamily: ['Noto Sans', 'sans-serif'],
  bodyFontFamily: ['Noto Sans', 'sans-serif'],
  scaleRatio: 3,
  // eslint-disable-next-line no-empty-pattern
  overrideStyles: ({}, _options) => ({
    'h1,h2,h3,h4,h5,h6': {
      fontWeight: '400',
    },
  }),
});

// Export helper functions
export const { scale, rhythm, options } = typography;
export default typography;
