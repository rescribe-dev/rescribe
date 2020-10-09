import { Path, GET } from 'typescript-rest';
import { RestReturnObj } from '../schema/utils/returnObj';

@Path('/')
export class Index {
  @GET
  index(): RestReturnObj {
    return {
      message: 'go to /graphql for playground'
    };
  }
}
