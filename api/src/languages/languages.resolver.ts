import { Resolver, Query } from 'type-graphql';
import { Language, languageColorMap } from '../utils/variables';
import { LanguageData } from '../schema/structure/language';

@Resolver()
class LanguagesResolver {
  @Query(_returns => [LanguageData])
  languages(): LanguageData[] {
    const allValues = Object.values(Language);
    return allValues.map(language => ({
      color: languageColorMap[language],
      name: language
    }));
  }
}

export default LanguagesResolver;
