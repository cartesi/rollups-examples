import {
    ApolloClient,
    InMemoryCache
} from '@apollo/client';
import { env } from '../../config/constants';

export const client = new ApolloClient({
    uri: env.DEFAULT_URL,
    cache: new InMemoryCache(),
});
