import UserCurrency, { UserCurrencyModel } from '../schema/users/userCurrency';
import { stripeClient } from '../stripe/init';
import { ObjectId } from 'mongodb';
import User from '../schema/users/user';

const getUserCurrency = async (currency: string, userData: User): Promise<UserCurrency> => {
  let userCurrencyData: UserCurrency | null = await UserCurrencyModel.findOne({
    user: userData._id,
    currency,
  });
  if (!userCurrencyData) {
    const stripeCustomer = await stripeClient.customers.create({
      email: userData.email,
      metadata: {
        id: userData._id.toHexString()
      }
    });
    const stripeCustomerID = stripeCustomer.id;
    const newUserCurrency: UserCurrency = {
      _id: new ObjectId(),
      currency,
      customer: stripeCustomerID,
      user: userData._id
    };
    await new UserCurrencyModel(newUserCurrency).save();
    userCurrencyData = newUserCurrency;
  }
  return userCurrencyData;
};

export default getUserCurrency;
