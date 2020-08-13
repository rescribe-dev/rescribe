import { Language } from '../schema/language';

export const defaultRepositoryImage = 'https://example.com/image.jpg';
export const saltRounds = 10;

export const defaultCurrency = 'usd';

export const languageColorMap: {[key: string]: number} = {};

languageColorMap[Language.none] = 0xCCCCCC;
languageColorMap[Language.java] = 0xF0AD4E;
languageColorMap[Language.javascript] = 0x0275D8; // switch to hex

export const checkLanguageColors = (): void => {
  for (const language in Language) {
    if (!(language in languageColorMap)) {
      throw new Error(`color for ${language} not in languag color map`);
    }
  }
};
