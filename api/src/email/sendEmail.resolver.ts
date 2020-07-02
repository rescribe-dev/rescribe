import { Resolver, ArgsType, Field, Args, Mutation, Ctx } from 'type-graphql';
import { IsEmail } from 'class-validator';
import sendgridClient from '@sendgrid/client';
import { configData } from '../utils/config';
import { sendgridAPIVersion } from './sendgrid';
import { verifyAdmin } from '../auth/checkAuth';
import { isProduction } from '../utils/mode';
import { emailTemplateFiles } from './compileEmailTemplates';
import { GraphQLContext } from '../utils/context';
import { ClientRequest } from '@sendgrid/client/src/request';

@ArgsType()
class SendTestEmailArgs {
  @Field(_type => String, { description: 'email' })
  @IsEmail({}, {
    message: 'invalid email provided'
  })
  email: string;

  @Field(_type => String, { description: 'name' })
  name: string;

  @Field(_type => String, { description: 'content', nullable: true })
  content?: string;

  @Field(_type => String, { description: 'subject', nullable: true })
  subject?: string;
}

interface SendEmailUtilArgs {
  name: string;
  email: string;
  content: string;
  subject: string;
  unsubscribeGroupID?: number;
  sendByEmail?: string;
  sendByName?: string;
}

export const sendEmailUtil = async (args: SendEmailUtilArgs): Promise<void> => {
  if (!args.sendByEmail) {
    args.sendByEmail = configData.NOREPLY_EMAIL;
  }
  if (!args.sendByName) {
    args.sendByName = configData.NOREPLY_EMAIL_NAME;
  }
  const sendgridRequest: ClientRequest = {
    body: {
      personalizations: [
        {
          to: [
            {
              email: args.email,
              name: args.name
            }
          ],
          subject: args.subject
        }
      ],
      from: {
        email: args.sendByEmail,
        name: args.sendByName
      },
      subject: args.subject,
      content: [
        {
          type: 'text/html',
          value: args.content
        }
      ]
    },
    method: 'POST',
    url: `${sendgridAPIVersion}/mail/send`,
  };
  // https://stackoverflow.com/a/62088449/8623391
  if (args.unsubscribeGroupID) {
    sendgridRequest.body['asm'] = {
      group_id: args.unsubscribeGroupID,
      groups_to_display: [args.unsubscribeGroupID],
    };
  }
  await sendgridClient.request(sendgridRequest);
};

@Resolver()
class SendTestEmailResolver {
  @Mutation(_returns => String)
  async sendTestEmail(@Args() args: SendTestEmailArgs, @Ctx() ctx: GraphQLContext): Promise<string> {
    if (isProduction() && !verifyAdmin(ctx)) {
      throw new Error('cannot run in production if not admin user');
    }
    let content = args.content;
    let subject = args.subject;
    const templateData = emailTemplateFiles.hello;
    if (!content) {
      const template = templateData.template;
      if (!template) {
        throw new Error('cannot find register email template');
      }
      content = template({
        name: args.name
      });
    }
    if (!subject) {
      subject = templateData.subject;
    }
    await sendEmailUtil({
      name: args.name,
      email: args.email,
      subject,
      content
    });
    return `sent email to ${args.email}`;
  }
}

export default SendTestEmailResolver;
