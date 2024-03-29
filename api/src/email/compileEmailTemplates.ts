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
  },
  welcomeNewsletter: {
    file: string;
    template?: HandlebarsTemplateDelegate<{
      name: string;
    }>;
    subject: string;
  }
}

const propertyOf = <TObj>(name: string): keyof TObj => name as keyof TObj;

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
  },
  welcomeNewsletter: {
    file: 'welcome_newsletter.html',
    template: undefined,
    subject: 'Welcome to reScribe!'
  },
};

const compileEmailTemplates = async (): Promise<void> => {
  for (const emailTemplateKey in emailTemplateFiles) {
    const currentTemplateElement = emailTemplateFiles[propertyOf<TemplateFiles>(emailTemplateKey)];
    const emailTemplate = await getS3EmailData(getEmailKey(currentTemplateElement.file), false);
    currentTemplateElement.template = Handlebars.compile(emailTemplate);
  }
};

export default compileEmailTemplates;
