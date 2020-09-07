import React from 'react';

import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';

import { setContext } from '@apollo/client/link/context';
import App from '../App';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_URI,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('@ControlReg:jwtToken');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const AProvider: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};

export { AProvider };
