import { observable, computed, action } from 'mobx'
import snackbar from './snackbar'
import token from './token'
import gql from 'graphql-tag'
import client from '../graphql/client'

class User {
  @observable data = null
  @observable isLoading = false
  @observable isFetchingUsers = false
  @observable isLoadingLogin = false

  @computed
  get isLoggedIn() {
    return !!this.data
  }

  @action
  async login(email, password) {
    try {
      this.isLoadingLogin = true

      let {
        data: {
          restaurantAdminLogin: access_token
        }
      } = await client.mutate({
        mutation: restaurantAdminLoginMutation,
        variables: {
          email,
          password,
        }
      })
      
      token.setAccessToken(access_token)
      await this.getUser()
      this.isLoadingLogin = false

      return access_token
    } catch(err) {
      this.isLoadingLogin = false
      console.log('ERROR WHILE LOGIN', err)
    }
  }

  @action
  async getUser() {
    try {
      this.isLoading = true
      let {
        data: {
          restaurant
        }
      } = await client.query({
        query: restaurantQuery
      })

      this.data = restaurant
      this.isLoading = false
      console.log(restaurant)
      return restaurant
    } catch (err) {
      this.isLoading = false
      snackbar.show('Error fetching user')
      console.log('ERROR WHILE FETCHING USERS', err)
    }
  }

  @action
  logout = () => {
    localStorage.clear()
    this.data = null
  }
}

const restaurantAdminLoginMutation = gql`
  mutation restaurantAdminLogin($email: String!, password: String!) {
    restaurantAdminLoginQuery(email: $email, password: $password)
  }
`

const restaurantQuery = gql`
  query restaurant {
    restaurant {
      id
      name
      description
      opening_time
      closing_time
      is_24_hours
      phone_number
      total_tables
      address
      picture
      slug
    }
  }
`

export default window.user = new User()