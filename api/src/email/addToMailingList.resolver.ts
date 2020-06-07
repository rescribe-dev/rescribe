/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, ArgsType, Field, Args, Mutation } from 'type-graphql';
import { IsEmail, MinLength } from 'class-validator';
import { nameMinLen } from '../utils/variables';
import sendgridClient from '@sendgrid/client';
import { configData } from '../utils/config';
import { sendgridAPIVersion } from '../utils/sendgrid';
import { verifyRecaptcha } from '../utils/recaptcha';

@ArgsType()
class AddToMailingListArgs {
  @Field(_type => String, { description: 'recaptcha token' })
  recaptchaToken: string;

  @Field(_type => String, { description: 'name' })
  @MinLength(nameMinLen, {
    message: `name must contain at least ${nameMinLen} characters`
  })
  name: string;

  @Field(_type => String, { description: 'email' })
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;
}

@Resolver()
class AddToMailingListResolver {
  @Mutation(_returns => String)
  async addToMailingList(@Args() args: AddToMailingListArgs): Promise<string> {
    if (!(await verifyRecaptcha(args.recaptchaToken))) {
      throw new Error('invalid recaptcha token');
    }
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
    return `added ${args.email} to mailing list`;
  }
}

export default AddToMailingListResolver;
