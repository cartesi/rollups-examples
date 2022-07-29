import {
    ApolloClient,
    InMemoryCache
} from '@apollo/client';
import { DEFAULT_URL } from './constants';

export const client = new ApolloClient({
    uri: DEFAULT_URL,
    cache: new InMemoryCache(),
});
