
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import onError from './errorHandler'

//CONFIG
import {
  GRAPHQL_URL,
} from '../../config'

//STORE
import { token } from '../stores'

let httpLink = new HttpLink({ 
  uri: GRAPHQL_URL
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token.bearerAccessToken
    }
  }
})

export default new ApolloClient({
  link: authLink.concat(onError).concat(httpLink),
  cache: new InMemoryCache()
})