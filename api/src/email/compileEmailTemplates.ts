import { getS3EmailData, getEmailKey } from '../utils/aws';
import Handlebars from 'handlebars';

interface TemplateFiles {
  hello: {
    file: string;
    template?: HandlebarsTemplateDelegate<{
      name: string;
    }>;
    subject: string;
  }
  verifyEmail: {
    file: string;
    template?: HandlebarsTemplateDelegate<{
      verify_url: string;
      name: string;
    }>;
    subject: string;
  },
  verifyEmailNewsletter: {
    file: string;
    template?: HandlebarsTemplateDelegate<{
      verify_url: string;
      name: string;
    }>;
    subject: string;
  }
}

export const emailTemplateFiles: TemplateFiles = {
  hello: {
    file: 'hello.html',
    template: undefined,
    subject: 'Hello World!'
  },
  verifyEmail: {
    file: 'verify_email.html',
    template: undefined,
    subject: 'Verify Email'
  },
  verifyEmailNewsletter: {
    file: 'verify_email_newsletter.html',
    template: undefined,
    subject: 'Verify Email for Newsletter'
  }
};

const compileEmailTemplates = async (): Promise<void> => {
  for (const emailTemplateKey in emailTemplateFiles) {
    const currentTemplateElement = emailTemplateFiles[emailTemplateKey as keyof TemplateFiles];
    const emailTemplate = await getS3EmailData(getEmailKey(currentTemplateElement.file));
    currentTemplateElement.template = Handlebars.compile(emailTemplate);
  }
};

export default compileEmailTemplates;
