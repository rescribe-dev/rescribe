import { getLogger } from 'log4js';
import { configData } from '../utils/config';
import { Stripe } from 'stripe';

const logger = getLogger();

export let stripeClient: Stripe;
export let paymentSystemInitialized = false;

export const initializeStripe = async (): Promise<void> => {
  if (configData.STRIPE_SECRET.length === 0) {
    const message = 'no stripe secret provided';
    throw new Error(message);
  }
  if (configData.STRIPE_WEBHOOK_SECRET.length === 0) {
    const message = 'no stripe webhook secret provided';
    throw new Error(message);
  }
  stripeClient = new Stripe(configData.STRIPE_SECRET, {
    apiVersion: '2020-03-02'
  });
  const balanceData = await stripeClient.balance.retrieve();
  let balance = 0;
  for (const current of balanceData.available) {
    balance += current.amount;
  }
  logger.info(`stripe balance of ${balance}`);
  paymentSystemInitialized = true;
};

export const requirePaymentSystemInitialized = (): void => {
  if (!paymentSystemInitialized) {
    throw new Error('payment system not initialized');
  }
};
