import { Resolver, Field, Args, Mutation, Ctx, ArgsType } from 'type-graphql';
import { requirePaymentSystemInitialized, stripeClient } from '../../stripe/init';
import { GraphQLContext } from '../../utils/context';
import { verifyLoggedIn } from '../../auth/checkAuth';
import Address, { AddressModel } from '../../schema/users/address';
import { ObjectId } from 'mongodb';
import { UserModel } from '../../schema/users/user';
import { Status, AddressType, GeocodingAddressComponentType } from '@googlemaps/google-maps-services-js';
import { mapsClient, apiKey } from './init';
import ReturnObj from '../../schema/utils/returnObj';
import { ApolloError } from 'apollo-server-express';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { PaymentMethodModel } from '../../schema/users/paymentMethod';
import { defaultCurrency } from '../../shared/variables';
import getUserCurrency from '../getUserCurrency';

@ArgsType()
class AddAddressArgs {
  @Field({ description: 'name' })
  name: string;

  @Field({ description: 'google places place id', nullable: true })
  place_id?: string;

  @Field({ description: 'line 1', nullable: true })
  line1?: string;

  @Field({ description: 'line 2', nullable: true })
  line2?: string;

  @Field({ description: 'city', nullable: true })
  city?: string;

  @Field({ description: 'state', nullable: true })
  state?: string;

  @Field({ description: 'postal code', nullable: true })
  postal_code?: string;

  @Field({ description: 'country', nullable: true })
  country?: string;

  @Field({ description: 'set to default', defaultValue: true, nullable: true })
  setDefault: boolean;
}

@Resolver()
class AddAddressResolver {
  @Mutation(_returns => ReturnObj)
  async addAddress(@Args() args: AddAddressArgs, @Ctx() ctx: GraphQLContext): Promise<ReturnObj> {
    requirePaymentSystemInitialized();
    if (!verifyLoggedIn(ctx)) {
      throw new Error('user not logged in');
    }
    const userID = new ObjectId(ctx.auth?.id);
    const addressID = new ObjectId();
    let newAddress: Address;
    if (args.place_id) {
      const mapRes = await mapsClient.geocode({
        params: {
          place_id: args.place_id,
          key: apiKey,
        }
      });
      if (mapRes.data.status !== Status.OK) {
        throw new Error(`problem with google maps request: ${mapRes.data.error_message}`);
      }
      if (mapRes.data.results.length === 0) {
        throw new Error('found no map data');
      }
      const placeData = mapRes.data.results[0];
      newAddress = {
        _id: addressID,
        user: userID,
        name: args.name,
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
      };

      for (const addressComponent of placeData.address_components) {
        if (addressComponent.types.includes(AddressType.subpremise)) {
          newAddress.line1 = addressComponent.long_name + ', ' ;
        } else if (addressComponent.types.includes(GeocodingAddressComponentType.street_number)) {
          newAddress.line1 += addressComponent.long_name + ' ';
        } else if (addressComponent.types.includes(AddressType.route)) {
          newAddress.line1 += addressComponent.long_name;
        } else if (addressComponent.types.some(type => [
          AddressType.locality, AddressType.sublocality, AddressType.administrative_area_level_2]
          .includes(type as AddressType))
        ) {
          newAddress.city = addressComponent.long_name;
        } else if (addressComponent.types.includes(AddressType.administrative_area_level_1)) {
          newAddress.state = addressComponent.short_name;
        } else if (addressComponent.types.includes(AddressType.postal_code)) {
          newAddress.postal_code = addressComponent.long_name;
        } else if (addressComponent.types.includes(AddressType.country)) {
          newAddress.country = addressComponent.short_name;
        }
      }
      if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code || !newAddress.country) {
        throw new Error('could not find all components of address given place id');
      }
    } else {
      if (!args.line1 || !args.city || !args.state || !args.postal_code || !args.country) {
        throw new Error('full address (except for line 2) must be defined');
      }
      newAddress = {
        _id: addressID,
        user: userID,
        name: args.name,
        line1: args.line1,
        line2: args.line2,
        city: args.city,
        state: args.state,
        postal_code: args.postal_code,
        country: args.country,
      };
    }
    await new AddressModel(newAddress).save();
    if (args.setDefault) {
      const userData = await UserModel.findById(userID);
      if (!userData) {
        throw new ApolloError('cannot find user data', `${INTERNAL_SERVER_ERROR}`);
      }
      let currency = defaultCurrency;
      if (userData.defaultPaymentMethod) {
        const paymentMethodData = await PaymentMethodModel.findById(userData.defaultPaymentMethod);
        if (!paymentMethodData) {
          throw new ApolloError('cannot find payment method data', `${INTERNAL_SERVER_ERROR}`);
        }
        currency = paymentMethodData.currency;
      }
      const userCurrencyData = await getUserCurrency(currency, userData);
      await stripeClient.customers.update(userCurrencyData.customer, {
        address: {
          city: newAddress.city,
          country: newAddress.country,
          line1: newAddress.postal_code,
          state: newAddress.state,
          line2: newAddress.line2,
          postal_code: newAddress.postal_code,
        },
      });
      await UserModel.updateOne({
        _id: userID
      }, {
        $set: {
          defaultAddress: newAddress._id,
        }
      });
    }
    return {
      message: `added address ${newAddress.name}`,
      _id: addressID,
    };
  }
}

export default AddAddressResolver;
