import { Language } from '../schema/misc/language';

export const defaultRepositoryImage = 'https://example.com/image.jpg';

export const languageColorMap: {[key: string]: string} = {};

languageColorMap[Language.none] = '#cccccc';
languageColorMap[Language.java] = '#f0ad4e';
languageColorMap[Language.javascript] = '#0275d8'; // switch to hex

const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const checkLanguageColors = (): void => {
  for (const language in Language) {
    if (!(language in languageColorMap)) {
      throw new Error(`color for ${language} not in language color map`);
    }
    if (!languageColorMap[language].match(validHex)) {
      throw new Error(`invalid hex provided for ${language}: ${languageColorMap[language]}`);
    }
  }
};
