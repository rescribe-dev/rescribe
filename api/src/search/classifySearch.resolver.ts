import { Resolver, ArgsType, Args, Query, Field, registerEnumType } from 'type-graphql';
import { queryMinLength } from '../shared/variables';
import { Language } from '../schema/misc/language';
import { MinLength } from 'class-validator';
import { uniformSpacing } from '../utils/misc';

const queryLengthText = 12;

enum SearchType {
  repository = 'repository',
  folderName = 'folderName',
  fileText = 'fileText',
  fileContent = 'fileContent',
};

registerEnumType(SearchType, {
  name: 'SearchType',
  description: 'search type',
});

@ArgsType()
export class ClassifySearchArgs {
  @MinLength(queryMinLength, {
    message: `query must be at least ${queryMinLength} characters long`
  })
  @Field(_type => String, { description: 'query' })
  query: string;
}

const getSearchType = (args: ClassifySearchArgs): SearchType => {
  const uniformQuery = uniformSpacing(args.query);
  const words = uniformQuery.split(' ');
  const numWords = words.length;
  if (numWords >= queryLengthText) {
    return SearchType.fileText;
  }
  for (const searchType of Object.values(SearchType)) {
    if (args.query.includes(searchType)) {
      return SearchType[searchType];
    }
  }
  for (const language of Object.values(Language)) {
    if (args.query.includes(language)) {
      return SearchType.fileContent;
    }
  }
  if (args.query.toLowerCase().includes("readme")) {
    return SearchType.repository;
  }
  return SearchType.repository;
};

@Resolver()
class ClassifySearchResolver {
  @Query(_returns => SearchType)
  async classifySearch(@Args() args: ClassifySearchArgs): Promise<SearchType> {
    return getSearchType(args);
  }
}

export default ClassifySearchResolver;
