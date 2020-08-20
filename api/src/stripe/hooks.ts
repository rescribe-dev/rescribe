import { Request, Response } from 'express';
import { stripeClient } from './init';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { configData } from '../utils/config';

// see https://stripe.com/docs/billing/subscriptions/payment
// https://stripe.com/docs/payments/payment-intents/migration/automatic-confirmation
// https://stripe.com/docs/payments/handling-payment-events#create-webhook

const stripeWebookHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      throw new Error('cannot find stripe signature');
    }
    const event = stripeClient.webhooks.constructEvent(req.body, stripeSignature, configData.STRIPE_WEBHOOK_SECRET);
    switch (event.type) {
      case 'invoice.paid':
        // subscription was updated. do something
        break;
      default:
        break;
    }
    res.status(OK).send('webhook completed');
  } catch (err) {
    const errObj = err as Error;
    res.status(BAD_REQUEST).send(`webhook error: ${errObj.message}`);
  }
};

export default stripeWebookHandler;
