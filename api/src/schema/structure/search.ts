import { ObjectType, Field, registerEnumType, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { LanguageData } from './language';
import Location from '../antlr/location';

export enum ResultType {
  file = 'file',
  import = 'import',
  class = 'class',
  function = 'function',
  variable = 'variable',
  comment = 'comment',
  name = 'name',
  path = 'path',
  importPath = 'importPath',
}

registerEnumType(ResultType, {
  name: 'ResultType',
  description: 'result type',
});

@ObjectType({ description: 'parent element object' })
export class ParentElement {
  @Field({ description: 'parent name' })
  name: string;
  @Field({ description: 'parent type' })
  type: ResultType;
}

// single search result (lowest denominator)
@ObjectType({ description: 'search result' })
export class SearchResult {
  @Field({ description: 'item name' })
  name: string;
  @Field({ description: 'item type' })
  type: ResultType;
  // parent elements
  @Field(_type => [ParentElement], { description: 'parents to current result' })
  parents: ParentElement[];
  // preview lines:
  @Field(_type => Int, { description: 'preview start line number' })
  startPreviewLineNumber: number;
  @Field(_type => [String], { description: 'preview start content' })
  startPreviewContent: string[];
  @Field(_type => Int, { description: 'preview end line number' })
  endPreviewLineNumber: number;
  @Field(_type => [String], { description: 'preview end content' })
  endPreviewContent: string[];
}

// file owner object
@ObjectType({ description: 'file owner' })
export class FileLocation {
  @Field({ description: 'repository name' })
  repository: string;
  @Field({ description: 'repository owner' })
  owner: string;
  @Field({ description: 'repository image' })
  image: string;
}

// single file result (collection of search results)
@ObjectType({ description: 'file result' })
export class FileResult {
  @Field({ description: 'file id' })
  readonly _id: ObjectId;
  @Field({ description: 'file name' })
  name: string;
  @Field({ description: 'file path' })
  path: string;
  @Field(_type => [SearchResult], { description: 'search results' })
  results: SearchResult[];
  @Field(_type => LanguageData, { description: 'language data' })
  language: LanguageData;
  @Field(_type => FileLocation, { description: 'file location' })
  location: FileLocation;
  @Field(_type => Location, { description: 'lines in file' })
  lines: Location;
}
