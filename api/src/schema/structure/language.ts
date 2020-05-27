import { registerEnumType, ObjectType, Field, Int } from 'type-graphql';

export enum Language {
  java = 'java',
  javascript = 'javascript',
}

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

export const languageColorMap: {[key: string]: number} = {};

languageColorMap[Language.java] = 0xF0AD4E;
languageColorMap[Language.javascript] = 0x0275D8; // switch to hex
