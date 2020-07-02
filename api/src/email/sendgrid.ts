import sendgridClient from '@sendgrid/client';
import { configData } from '../utils/config';

export const sendgridAPIVersion = '/v3';

export const initializeSendgrid = async (): Promise<void> => {
  if (configData.SENDGRID_API_KEY.length === 0) {
    throw new Error('no private key supplied');
  }
  if (configData.SENDGRID_MAILING_LIST_ID.length === 0) {
    throw new Error('no sendgrid mailing list id provided');
  }
  if (configData.SENDGRID_MAILING_LIST_UNSUBSCRIBE_ID === 0) {
    throw new Error('no sendgrid mailing list unsubscribe id provided');
  }
  sendgridClient.setApiKey(configData.SENDGRID_API_KEY);
  await sendgridClient.request({
    url: `${sendgridAPIVersion}/ips`,
    method: 'GET',
  });
};
