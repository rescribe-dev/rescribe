import { prop as Property } from '@typegoose/typegoose';

export class PaymentMethod {
  @Property({ required: true })
  method: string;
}

export default class CurrencyPaymentMethods {
  @Property({ required: true })
  customer: string;

  // payment not required for free plan
  @Property({ required: true, type: PaymentMethod })
  methods: PaymentMethod[];
}
