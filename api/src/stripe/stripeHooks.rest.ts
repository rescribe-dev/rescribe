import { Path, POST, ContextRequest, Errors } from 'typescript-rest';
import { Request } from 'express';
import { configData } from '../utils/config';
import { stripeClient } from './init';
import { paymentSystemInitialized } from '../stripe/init';

// see https://stripe.com/docs/billing/subscriptions/payment
// https://stripe.com/docs/payments/payment-intents/migration/automatic-confirmation
// https://stripe.com/docs/payments/handling-payment-events#create-webhook

@Path('/stripeHooks')
export class StripeHooks {
  @POST
  async stripeHooks(@ContextRequest req: Request): Promise<string> {
    if (!paymentSystemInitialized) {
      throw new Errors.ForbiddenError('payment system not initialized');
    }
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
      return 'webhook completed';
    } catch (err) {
      const errObj = err as Error;
      throw new Errors.BadRequestError(`webhook error: ${errObj.message}`);
    }
  }
}
