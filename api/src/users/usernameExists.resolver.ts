import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { accountExistsUsername } from './shared';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
class UsernameExistsArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'username' })
  username: string;
}

@Resolver()
class UsernameExistsResolver {
  @Mutation(_returns => Boolean)
  async usernameExists(@Args() args: UsernameExistsArgs): Promise<boolean> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
    return accountExistsUsername(args.username);
  }
}

export default UsernameExistsResolver;
