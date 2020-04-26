import ApolloClient from 'apollo-boost';
import axios, { AxiosInstance } from 'axios';
import 'cross-fetch/polyfill';

export let apolloClient: ApolloClient<unknown>;

export let axiosClient: AxiosInstance;

export const initializeAPIClient = (): void => {
  if (!process.env.API_URL){
    throw new Error('no api url provided');
  }
  apolloClient = new ApolloClient({
    uri: `${process.env.API_URL}/graphql`,
  });
  axiosClient = axios.create({
    baseURL: process.env.API_URL
  });
};
