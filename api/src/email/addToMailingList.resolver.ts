import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { IsEmail } from 'class-validator';
import sendgridClient from '@sendgrid/client';
import { configData } from '../utils/config';
import { sendgridAPIVersion } from './sendgrid';
import { verifyRecaptcha } from '../utils/recaptcha';
import { emailTemplateFiles } from './compileEmailTemplates';
import { getSecret, jwtType, VerifyType, getJWTIssuer, verifyJWTExpiration } from '../utils/jwt';
import { sign, SignOptions } from 'jsonwebtoken';
import { verifyLoggedIn } from '../auth/checkAuth';
import { GraphQLContext } from '../utils/context';
import { sendEmailUtil } from './sendEmail.resolver';
import { UserModel } from '../schema/users/user';

@ArgsType()
class AddToMailingListArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'name' })
  name: string;

  @Field(_type => String, { description: 'email' })
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;
}

export interface VerifyNewsletterTokenData {
  email: string;
  name: string;
  type: VerifyType.verifyNewsletter;
}

export const generateJWTVerifyEmailNewsletter = (email: string, name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let secret: string;
    let jwtIssuer: string;
    try {
      secret = getSecret(jwtType.LOCAL);
      jwtIssuer = getJWTIssuer();
    } catch (err) {
      reject(err as Error);
      return;
    }
    const authData: VerifyNewsletterTokenData = {
      email,
      name,
      type: VerifyType.verifyNewsletter
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

interface AddToMailingListUtilArgs {
  email: string;
  name: string;
}

export const addToMailingListUtil = async (args: AddToMailingListUtilArgs): Promise<void> => {
  await sendgridClient
    .request({
      body: {
        contacts: [
          {
            email: args.email,
            name: args.name
          },
        ],
        list_ids: [configData.SENDGRID_MAILING_LIST_ID],
      },
      method: 'PUT',
      url: `${sendgridAPIVersion}/marketing/contacts`,
    });
  const emailTemplateData = emailTemplateFiles.welcomeNewsletter;
  const template = emailTemplateData.template;
  if (!template) {
    throw new Error('cannot find welcome newsletter email template');
  }
  const emailData = template({
    name: args.name
  });
  await sendEmailUtil({
    content: emailData,
    email: args.email,
    sendByEmail: configData.MAILING_LIST_EMAIL,
    sendByName: configData.MAILING_LIST_EMAIL_NAME,
    unsubscribeGroupID: configData.SENDGRID_MAILING_LIST_UNSUBSCRIBE_ID,
    name: args.name,
    subject: emailTemplateData.subject
  });
};

@Resolver()
class AddToMailingListResolver {
  @Mutation(_returns => String)
  async addToMailingList(@Args() args: AddToMailingListArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
    if (verifyLoggedIn(ctx) && ctx.auth) {
      const user = await UserModel.findById(ctx.auth.id);
      if (user && user.email === args.email) {
        await addToMailingListUtil({
          email: args.email,
          name: args.name
        });
        return `added ${args.email} to mailing list`;
      }
    }
    const emailTemplateData = emailTemplateFiles.verifyEmailNewsletter;
    const template = emailTemplateData.template;
    if (!template) {
      throw new Error('cannot find register email template');
    }
    const verify_token = await generateJWTVerifyEmailNewsletter(args.email, args.name);
    const emailData = template({
      name: args.name,
      verify_url: `${configData.WEBSITE_URL}?token=${verify_token}&verify_newsletter=true`,
    });
    await sendEmailUtil({
      content: emailData,
      email: args.email,
      name: args.name,
      subject: emailTemplateData.subject
    });
    return `check email ${args.email} for confirmation`;
  }
}

export default AddToMailingListResolver;
