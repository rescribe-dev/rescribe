import React, { useState, useEffect, ReactNode } from 'react';
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
import { getAuthToken, isLoggedIn } from 'state/auth/getters';
import { isSSR } from './checkSSR';
import { useSecure } from './useSecure';
import { toast } from 'react-toastify';

export let client: ApolloClient<any>;

export const initializeApolloClient = async (): Promise<void> => {
  const defaultLink = new HttpLink({
    uri: `${useSecure ? 'https' : 'http'}://${
      process.env.GATSBY_API_URL
    }/graphql`,
    fetch,
    credentials: 'include',
  });

  const httpMiddleware = setContext(async (_operation) => {
    try {
      const authToken = getAuthToken();
      return {
        headers: {
          authorization: authToken.length > 0 ? `Bearer ${authToken}` : null,
        },
      };
    } catch (_err) {
      // handle error
    }
  });

  const httpLink = from([httpMiddleware, defaultLink]);
  if (!process.env.GATSBY_API_URL) {
    throw new Error('no api url provided');
  }
  let link = httpLink;
  const authToken = getAuthToken();
  const wsForNode = isSSR ? ws : null;
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

interface WrapApolloArgs {
  children?: ReactNode;
}

export const WrapApollo = (args: WrapApolloArgs): JSX.Element => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        await initializeApolloClient();
        setLoading(false);
      } catch (err) {
        const errObj = err as Error;
        toast(errObj.message, {
          type: 'error',
        });
      }
    })();
  }, []);
  return (
    <>
      {loading ? null : (
        // @ts-ignore TODO - fix this
        <ApolloProvider client={client}>{args.children}</ApolloProvider>
      )}
    </>
  );
};
