import { configData } from '../../utils/config';
import { Client } from '@googlemaps/google-maps-services-js';

export let mapsClient: Client;

export let apiKey: string;

export const initializeGoogleMaps = (): void => {
  if (configData.GOOGLE_MAPS_API_KEY.length === 0) {
    throw new Error('no google maps api key supplied');
  }
  apiKey = configData.GOOGLE_MAPS_API_KEY;
  mapsClient = new Client({});
};
