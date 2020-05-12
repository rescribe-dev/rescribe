/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Args, Query, Field } from 'type-graphql';

@ArgsType()
class FileTextArgs {
  @Field(_type => String, { description: 'file id' })
  id: string;
  @Field(_type => Number, { description: 'start line' })
  start: number;
  @Field(_type => Number, { description: 'end line' })
  end: number;
}

@Resolver()
class FileText {
  @Query(_returns => String)
  async fileText(@Args() _args: FileTextArgs): Promise<string> {
    return '';
  }
}

export default FileText;
