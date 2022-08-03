import {
    ApolloClient,
    InMemoryCache
} from '@apollo/client';
import { env } from '../../config/constants';

export const client = new ApolloClient({
    uri: env.VITE_SERVER_URL_DEFAULT,
    cache: new InMemoryCache(),
});
