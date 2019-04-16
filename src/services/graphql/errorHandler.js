import {onError} from 'apollo-link-error'
import { user, reloadCountdownTimer } from '../stores'

export default onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(errorData => {
      let { message, locations, path } = errorData
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      
      console.log(locations)
      return errorData
    })
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)

    if (networkError.statusCode === 401) {
      (async () => {
        await user.logout() 
        reloadCountdownTimer.reload()
      })()
    }
  }
})