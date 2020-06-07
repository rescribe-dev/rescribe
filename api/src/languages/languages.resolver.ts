import { Resolver, Query } from 'type-graphql';
import { Language, languageColorMap } from '../utils/variables';
import { LanguageData } from '../schema/structure/language';

@Resolver()
class LanguagesResolver {
  @Query(_returns => [LanguageData])
  languages(): LanguageData[] {
    const allValues = Object.values(Language);
    return allValues.splice(0, allValues.length / 2).map(language => ({
      color: languageColorMap[language],
      name: language
    }));
  }
}

export default LanguagesResolver;
