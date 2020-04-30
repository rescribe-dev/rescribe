import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import axios, { AxiosInstance } from 'axios';
import ws from 'ws';
import fetch from "isomorphic-fetch";
import { ApolloLink, from } from 'apollo-link';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { configData } from './config';

export let axiosClient: AxiosInstance;

export let apolloClient: ApolloClient<any>;

export let websiteURL: string;

export let apiURL: string;

let httpLink: ApolloLink;

const initializeApolloHttpClient = (): void => {
  const link = new HttpLink({
    uri: apiURL,
    fetch,
  });
  const httpMiddleware = new ApolloLink((operation, forward) => {
    if (configData.authToken.length > 0) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${configData.authToken}`,
        }
      });
    }
    return forward(operation);
  });
  httpLink = from([httpMiddleware, link]);
};

export const initializeApolloClient = (): void => {
  let link = httpLink;
  if (configData.authToken.length > 0) {
    const wsClient = new SubscriptionClient(
      `${configData.useSecure ? 'wss' : 'ws'}://${configData.apiURL}/graphql`,
      {
        reconnect: true,
        connectionParams: {
          authToken: configData.authToken
        }
      },
      ws
    );
    const websocket = new WebSocketLink(wsClient);
    link = ApolloLink.split(
      ({ query }) => {
        const mainDef = getMainDefinition(query);
        if (mainDef.kind !== 'OperationDefinition')
          return false;
        return mainDef.operation === 'subscription';
      },
      websocket,
      link,
    );
  }
  apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

export const initializeAPIClient = async (): Promise<void> => {
  apiURL = `${configData.useSecure ? 'https' : 'http'}://${configData.apiURL}/graphql`;
  websiteURL = `${configData.useSecure ? 'https' : 'http'}://${configData.websiteURL}`;
  initializeApolloHttpClient();
  initializeApolloClient();
  axiosClient = axios.create({
    baseURL: configData.apiURL
  });
};
