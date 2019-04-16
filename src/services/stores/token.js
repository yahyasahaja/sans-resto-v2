import { observable, computed, action } from 'mobx'
import { ACCESS_TOKEN_STORAGE_URI } from '../../config'
import user from './user'

class Token {
  @observable rawAccessToken = null
  @observable refreshToken = null
  @observable isSettingUp = true

  @computed
  get bearerAccessToken() {
    return `Bearer ${this.rawAccessToken}`
  }

  @action
  async setup() {
    this.isSettingUp = true 
    //get access token
    let access_token = localStorage.getItem(ACCESS_TOKEN_STORAGE_URI)
    if (!access_token) return this.isSettingUp = false
    this.setAccessToken(access_token)
    
    //check if not expired
    let userData = await user.getUser()
    if (userData) {
      this.isSettingUp = false
      return userData
    }
  }

  @action
  setAccessToken(token) {
    this.rawAccessToken = token
    localStorage.setItem(ACCESS_TOKEN_STORAGE_URI, token)
  }
}

export default window.token = new Token()