import sendgridClient from '@sendgrid/client';
import { configData } from '../utils/config';
import { subDays, format } from 'date-fns';

export const sendgridAPIVersion = '/v3';

const initRequestDaysAgo = 5;

export const initializeSendgrid = async (): Promise<void> => {
  if (configData.SENDGRID_API_KEY.length === 0) {
    throw new Error('no private key supplied');
  }
  if (configData.SENDGRID_MAILING_LIST_ID.length === 0) {
    throw new Error('no sendgrid mailing list id provided');
  }
  sendgridClient.setApiKey(configData.SENDGRID_API_KEY);
  const startDate = subDays(new Date(), initRequestDaysAgo);
  const startDateFormatted = format(startDate, 'yyyy-MM-dd');
  await sendgridClient.request({
    url: `${sendgridAPIVersion}/stats?start_date=${startDateFormatted}`,
    method: 'GET',
  });
};
