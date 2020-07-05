export const defaultRepositoryImage = 'https://example.com/image.jpg';
export const saltRounds = 10;

// supported languages:

export enum Language {
  none = 'none',
  java = 'java',
  javascript = 'javascript',
}

export const languageColorMap: {[key: string]: number} = {};

languageColorMap[Language.java] = 0xF0AD4E;
languageColorMap[Language.javascript] = 0x0275D8; // switch to hex
