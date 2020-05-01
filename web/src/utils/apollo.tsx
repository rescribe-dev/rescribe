import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-client";
import fetch from "isomorphic-fetch";
import { split, ApolloLink, from } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getMainDefinition } from "apollo-utilities";
import ws from "ws";
import { getAuthToken, isLoggedIn } from "../state/auth/getters";
import { isSSR } from "./checkSSR";

const useSecure = process.env.GATSBY_USE_SECURE === "true";

const link = new HttpLink({
  uri: `${useSecure ? "https" : "http"}://${
    process.env.GATSBY_API_URL
  }/graphql`,
  fetch,
});
const httpMiddleware = new ApolloLink((operation, forward) => {
  const authToken = getAuthToken();
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
  }
  return forward(operation);
});

const httpLink = from([httpMiddleware, link]);

export let client: ApolloClient<any>;

const wsForNode = isSSR ? ws : null;

export const initializeApolloClient = (): void => {
  let link = httpLink;
  const authToken = getAuthToken();
  if (isLoggedIn()) {
    const wsClient = new SubscriptionClient(
      `${useSecure ? "wss" : "ws"}://${process.env.GATSBY_API_URL}/graphql`,
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
        if (mainDef.kind !== "OperationDefinition") return false;
        return mainDef.operation === "subscription";
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
