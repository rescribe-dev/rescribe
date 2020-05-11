import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-client';
import fetch from 'isomorphic-fetch';
import { split, from } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import ws from 'ws';
import { getAuthToken, isLoggedIn } from '../state/auth/getters';
import { isSSR } from './checkSSR';
import { useSecure } from './useSecure';

const link = new HttpLink({
  uri: `${useSecure ? 'https' : 'http'}://${
    process.env.GATSBY_API_URL
  }/graphql`,
  fetch,
  credentials: 'include',
});

const httpMiddleware = setContext(async (_operation) => {
  try {
    const loggedIn = await isLoggedIn();
    const authToken = getAuthToken();
    return {
      headers: {
        authorization: loggedIn ? `Bearer ${authToken}` : null,
      },
    };
  } catch (_err) {
    // handle error
  }
});

const httpLink = from([httpMiddleware, link]);

export let client: ApolloClient<any>;

const wsForNode = isSSR ? ws : null;

export const initializeApolloClient = async (): Promise<void> => {
  let link = httpLink;
  const authToken = getAuthToken();
  if (await isLoggedIn()) {
    const wsClient = new SubscriptionClient(
      `${useSecure ? 'wss' : 'ws'}://${process.env.GATSBY_API_URL}/graphql`,
      {
        reconnect: true,
        connectionParams: {
          authToken,
        },
      },
      wsForNode
    );
    const websocket = new WebSocketLink(wsClient);
    link = split(
      ({ query }) => {
        const mainDef = getMainDefinition(query);
        if (mainDef.kind !== 'OperationDefinition') return false;
        return mainDef.operation === 'subscription';
      },
      websocket,
      link
    );
  }
  client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

initializeApolloClient();

export const WrapApollo = (element: any) => {
  return <ApolloProvider client={client}>{element}</ApolloProvider>;
};
