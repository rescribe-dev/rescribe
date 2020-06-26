import { Resolver, ArgsType, Args, Query, Field, Ctx, Int } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import { Min, Max, MinLength } from 'class-validator';
import { queryMinLength } from '../utils/variables';
import { Folder } from '../schema/structure/folder';

const maxPerPage = 20;

@ArgsType()
export class FoldersArgs {
  @MinLength(queryMinLength, {
    message: `query must be at least ${queryMinLength} characters long`
  })
  @Field(_type => String, { description: 'query', nullable: true })
  query?: string;

  @Field({ description: 'file name', nullable: true })
  name?: string;

  @Min(0, {
    message: 'page number must be greater than or equal to 0'
  })
  @Field(_type => Int, { description: 'page number', nullable: true })
  page?: number;

  @Min(1, {
    message: 'per page must be greater than or equal to 1'
  })
  @Max(maxPerPage, {
    message: `per page must be less than or equal to ${maxPerPage}`
  })
  @Field(_type => Int, { description: 'number per page', nullable: true })
  perpage?: number;
}

@Resolver()
class FoldersResolver {
  @Query(_returns => [Folder])
  async folders(@Args() _args: FoldersArgs, @Ctx() _ctx: GraphQLContext): Promise<Folder[]> {
    return [];
  }
}

export default FoldersResolver;
