import { Resolver, Query } from 'type-graphql';
import { languageColorMap } from '../utils/variables';
import { LanguageData } from '../schema/structure/language';
import { Language } from '../schema/misc/language';

@Resolver()
class LanguagesResolver {
  @Query(_returns => [LanguageData])
  languages(): LanguageData[] {
    const allValues = Object.values(Language);
    return allValues.map(language => ({
      darkColor: languageColorMap[language].dark,
      lightColor: languageColorMap[language].light,
      name: language
    }));
  }
}

export default LanguagesResolver;
