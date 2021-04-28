import { Language } from '../schema/misc/language';

export const defaultRepositoryImage = 'https://i.stack.imgur.com/frlIf.png';
export const maxFileUploadSize = 15 * 1e6; // bytes

export const languageColorMap: {[key: string]: {
  light: string;
  dark: string;
}} = {};

languageColorMap[Language.none] = {
  light: '#cccccc',
  dark: '#cccccc'
};

languageColorMap[Language.java] = {
  light: '#eceeef',
  dark: '#f0ad4e'
};

languageColorMap[Language.javascript] = {
  light: '#0275d8',
  dark: '#0275d8'
};

const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const checkLanguageColors = (): void => {
  for (const language in Language) {
    if (!(language in languageColorMap)) {
      throw new Error(`color for ${language} not in language color map`);
    }
    if (!languageColorMap[language].light.match(validHex)) {
      throw new Error(`invalid light hex provided for ${language}: ${languageColorMap[language]}`);
    }
    if (!languageColorMap[language].dark.match(validHex)) {
      throw new Error(`invalid dark hex provided for ${language}: ${languageColorMap[language]}`);
    }
  }
};
