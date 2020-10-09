import { Path, GET } from 'typescript-rest';
import { RestReturnObj } from '../schema/utils/returnObj';

@Path('/hello')
export class Hello {
  @GET
  hello(): RestReturnObj {
    return {
      message: 'hello world!'
    };
  }
}
