import { prop as Property } from '@typegoose/typegoose';

export default class PaymentMethod {
  @Property({ required: true })
  customer: string;

  // payment not required for free plan
  @Property({ required: false })
  payment: string;
}
