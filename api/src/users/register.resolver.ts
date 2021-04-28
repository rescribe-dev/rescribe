import argon2 from 'argon2';
import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { IsEmail, MinLength, Matches } from 'class-validator';
import { passwordMinLen, specialCharacterRegex, numberRegex, lowercaseLetterRegex, capitalLetterRegex } from '../shared/variables';
import { accountExistsEmail, accountExistsUsername } from './shared';
import { ObjectID, ObjectId } from 'mongodb';
import User, { UserType, UserModel } from '../schema/users/user';
import { verifyRecaptcha } from '../utils/recaptcha';
import { emailTemplateFiles } from '../email/compileEmailTemplates';
import { sendEmailUtil } from '../email/sendEmail.resolver';
import { configData } from '../utils/config';
import { VerifyType, getSecret, getJWTIssuer, verifyJWTExpiration } from '../utils/jwt';
import { SignOptions, sign } from 'jsonwebtoken';
import { defaultCurrency } from '../shared/variables';
import { stripeClient } from '../stripe/init';
import { getProduct } from '../products/product.resolver';
import UserCurrency, { UserCurrencyModel } from '../schema/users/userCurrency';
import { loginType } from '../auth/shared';
import { addIdenticon } from '../utils/identicon';
import { AccessLevel } from '../schema/users/access';

@ArgsType()
class RegisterArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'name' })
  name: string;

  @Field(_type => String, { description: 'username' })
  username: string;

  @Field(_type => String, { description: 'email' })
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;

  @Field(_type => String, { description: 'password' })
  @MinLength(passwordMinLen, {
    message: `password must contain at least ${passwordMinLen} characters`
  })
  @Matches(lowercaseLetterRegex, {
    message: 'no lowercase letter found'
  })
  @Matches(capitalLetterRegex, {
    message: 'no capital letter found'
  })
  @Matches(numberRegex, {
    message: 'no number found'
  })
  @Matches(specialCharacterRegex, {
    message: 'no special characters found'
  })
  password: string;
}

export interface VerifyTokenData {
  id: string;
  type: VerifyType.verify;
}

export const generateJWTVerifyEmail = (userID: ObjectId): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(loginType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    const authData: VerifyTokenData = {
      id: userID.toHexString(),
      type: VerifyType.verify
    };
    const signOptions: SignOptions = {
      issuer: jwtIssuer,
      expiresIn: verifyJWTExpiration
    };
    sign(authData, secret, signOptions, (err, token) => {
      if (err) {
        reject(err as Error);
      } else {
        resolve(token as string);
      }
    });
  });
};

@Resolver()
class RegisterResolver {
  @Mutation(_returns => String)
  async register(@Args() args: RegisterArgs): Promise<string> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
    if (await accountExistsEmail(args.email)) {
      throw new Error('user with email already registered');
    }
    if (await accountExistsUsername(args.username)) {
      throw new Error('user with username already exists');
    }
    const id = new ObjectID();
    const defaultProduct = await getProduct({
      name: undefined
    });
    let planStripeID: string | undefined = undefined;
    for (const currency of defaultProduct.plans[0].currencies.keys()) {
      if (currency === defaultCurrency) {
        planStripeID = defaultProduct.plans[0].currencies.get(currency) as string;
      }
    }
    if (!planStripeID) {
      throw new Error(`cannot find "${defaultProduct.name}" plan id for ${defaultCurrency}`);
    }
    const stripeCustomer = await stripeClient.customers.create({
      email: args.email,
      metadata: {
        id: id.toHexString()
      }
    });
    const subscription = await stripeClient.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{
        plan: planStripeID
      }]
    });
    const hashedPassword = await argon2.hash(args.password);
    const mediaID = await addIdenticon(id, AccessLevel.view);
    const newUser: User = {
      _id: id,
      name: args.name,
      avatar: mediaID,
      username: args.username,
      email: args.email,
      password: hashedPassword,
      plan: defaultProduct.name,
      subscriptionID: subscription.id,
      type: UserType.user,
      emailVerified: false,
      tokenVersion: 0,
      githubInstallationID: -1,
      githubUsername: '',
      projects: [],
      repositories: []
    };
    const newUserCurrency: UserCurrency = {
      _id: new ObjectId(),
      currency: defaultCurrency,
      customer: stripeCustomer.id,
      user: id
    };
    await new UserCurrencyModel(newUserCurrency).save();
    const emailTemplateData = emailTemplateFiles.verifyEmail;
    const template = emailTemplateData.template;
    if (!template) {
      throw new Error('cannot find register email template');
    }
    const verify_token = await generateJWTVerifyEmail(newUser._id);
    const emailData = template({
      name: newUser.name,
      verify_url: `${configData.WEBSITE_URL}/login?token=${verify_token}&verify_email=true`
    });
    await sendEmailUtil({
      content: emailData,
      email: newUser.email,
      name: newUser.name,
      subject: emailTemplateData.subject
    });
    const userCreateRes = await new UserModel(newUser).save();
    return `created user ${userCreateRes.id}`;
  }
}

export default RegisterResolver;
