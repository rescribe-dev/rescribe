import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { MinLength } from 'class-validator';
import { minJWTLen } from '../shared/variables';
import { UserModel } from '../schema/auth/user';
import { VerifyTokenData } from './register.resolver';
import { getSecret, jwtType, VerifyType } from '../utils/jwt';
import { VerifyOptions, verify } from 'jsonwebtoken';
import { VerifyNewsletterTokenData, addToMailingListUtil } from '../email/addToMailingList.resolver';

@ArgsType()
class VerifyEmailArgs {
  @Field(_type => String, { description: 'name' })
  @MinLength(minJWTLen, {
    message: `jwt must contain at least ${minJWTLen} characters`
  })
  token: string;
}

export const decodeVerify = (token: string): Promise<VerifyTokenData | VerifyNewsletterTokenData> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    try {
      secret = getSecret(jwtType.LOCAL);
    } catch (err) {
      reject(err as Error);
      return;
    }
    const jwtConfig: VerifyOptions = {
      algorithms: ['HS256']
    };
    verify(token, secret, jwtConfig, (err, res: any) => {
      if (err) {
        reject(err as Error);
      } else {
        const type: VerifyType = res.type;
        if (type === VerifyType.verify) {
          resolve(res as VerifyTokenData);
        } else {
          resolve(res as VerifyNewsletterTokenData);
        }
      }
    });
  });
};

@Resolver()
class VerifyEmailResolver {
  @Mutation(_returns => String)
  async verifyEmail(@Args() args: VerifyEmailArgs): Promise<string> {
    let verificationData = await decodeVerify(args.token);
    if (verificationData.type === VerifyType.verifyNewsletter) {
      verificationData = verificationData as VerifyNewsletterTokenData;
      await addToMailingListUtil({
        email: verificationData.email,
        name: verificationData.name
      });
      return `added ${verificationData.email} to newsletter`;
    }
    verificationData = verificationData as VerifyTokenData;
    const user = await UserModel.findById(verificationData.id);
    if (!user) {
      throw new Error('cannot find user with given id');
    }
    if (user.emailVerified) {
      throw new Error('email already verified');
    }
    await UserModel.updateOne({
      _id: user._id
    }, {
      $set: {
        emailVerified: true
      }
    });
    return (`verified email ${user.email}`);
  }
}

export default VerifyEmailResolver;
