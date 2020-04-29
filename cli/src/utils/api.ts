import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import axios, { AxiosInstance } from 'axios';
import ws from 'ws';
import 'cross-fetch/polyfill';
import { ApolloLink } from 'apollo-link';
import { OperationDefinitionNode } from 'graphql';

const useSecure = process.env.USESECURE === 'true';

export let axiosClient: AxiosInstance;

export let defaultApolloClient: ApolloClient<any>;

export let websiteURL: string;

export let apiURL: string;

export const createApolloClient = async (authToken?: string): Promise<ApolloClient<any>> => {
  const httpLink = new HttpLink({
    uri: apiURL,
    headers: {
      authorization: authToken ? `Bearer ${authToken}` : ''
    }
  });
  const wsLink = new WebSocketLink({
    uri: `${useSecure ? 'wss' : 'ws'}://${process.env.API_URL}/graphql`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken
      },
    },
    webSocketImpl: ws
  });
  const apolloClient = new ApolloClient({
    link: ApolloLink.from([
      ApolloLink.split(
        ({ query }) => {
          const definitionRes = getMainDefinition(query);
          if (definitionRes.kind !== 'OperationDefinition')
            return false;
          const definitionOp = definitionRes as OperationDefinitionNode;
          return definitionOp.operation === 'subscription';
        },
        wsLink,
        httpLink,
      ),
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {}
  });
  return apolloClient;
};

export const initializeAPIClient = async (): Promise<void> => {
  if (!process.env.API_URL) {
    throw new Error('no api url provided');
  }
  if (!process.env.WEBSITE_URL) {
    throw new Error('no website url provided');
  }
  apiURL = `${useSecure ? 'https' : 'http'}://${process.env.API_URL}/graphql`;
  websiteURL = `${useSecure ? 'https' : 'http'}://${process.env.WEBSITE_URL}`;
  defaultApolloClient = await createApolloClient();
  axiosClient = axios.create({
    baseURL: process.env.API_URL
  });
};
