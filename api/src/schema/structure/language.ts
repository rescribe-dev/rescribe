import { registerEnumType, ObjectType, Field, Int } from 'type-graphql';
import { Language } from '../../utils/variables';

registerEnumType(Language, {
  name: 'Language',
  description: 'language type',
});

// language data object
@ObjectType({ description: 'language data' })
export class LanguageData {
  @Field(_type => Language, { description: 'language name' })
  name: Language;
  @Field(_type => Int, { description: 'associated color' })
  color: number;
}
