import axios from 'axios';
import { configData } from './config';

export const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaRes {
  success: boolean;
}

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  if (configData.RECAPTCHA_SECRET.length === 0) {
    throw new Error('cannot find recaptcha secret');
  }
  const recaptchaRes = await axios.post<RecaptchaRes>(recaptchaURL, null, {
    params: {
      response: token,
      secret: configData.RECAPTCHA_SECRET
    }
  });
  return recaptchaRes.data.success;
};
