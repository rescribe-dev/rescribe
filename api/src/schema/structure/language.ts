import { registerEnumType, ObjectType, Field } from 'type-graphql';
import { Language } from '../misc/language';

registerEnumType(Language, {
  name: 'Language',
  description: 'language type',
});

// language data object
@ObjectType({ description: 'language data' })
export class LanguageData {
  @Field(_type => Language, { description: 'language name' })
  name: Language;
  @Field({ description: 'associated color' })
  color: string;
}
