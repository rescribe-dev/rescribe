import { ApolloError } from 'apollo-server-express';
import { Language } from '../schema/misc/language';
import statusCodes from 'http-status-codes';
import { uniformSpacing } from '../utils/misc';

export const languageKey: unique symbol = Symbol('languages');

interface QueryLangData {
  [languageKey]: Language[];
  libraries: string[];
};

interface QueryLangRes {
  data: QueryLangData;
  hasData: boolean;
};

const keyMap: Record<keyof QueryLangData, string[]> = {
  [languageKey]: ['lang', 'language', 'languages'],
  libraries: ['lib', 'library', 'libraries'],
};

const mapDeliminator = ':';

const parseQueryLanguage = (query: string): QueryLangRes => {
  const data: QueryLangData = {
    [languageKey]: [],
    libraries: []
  };
  let foundData = false;
  const uniformQuery = uniformSpacing(query);
  for (const word of uniformQuery.split(' ')) {
    const delimIndex = word.indexOf(mapDeliminator);
    if (delimIndex > -1) {
      const givenKey = word.substring(0, delimIndex);
      for (const potentialKey in keyMap) {
        const currentKey = potentialKey as unknown as keyof QueryLangData;
        if (keyMap[currentKey].includes(givenKey)) {
          const value = word.substr(delimIndex + 1);
          const commaSeparated = value.split(',');
          for (const currentElement of commaSeparated) {
            if (currentKey === languageKey) {
              const language = currentElement as Language;
              if (!Object.values(Language).includes(language)) {
                throw new ApolloError(`language ${language} is not supported`, `${statusCodes.BAD_REQUEST}`);
              }
              data[languageKey].push(language);
            } else {
              data[currentKey].push(currentElement);
            }
            foundData = true;
          }
        }
      }
    }
  }
  return {
    data,
    hasData: foundData
  };
};

export default parseQueryLanguage;
