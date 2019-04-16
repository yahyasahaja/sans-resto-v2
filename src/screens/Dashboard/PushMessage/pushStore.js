import { observable, action } from 'mobx'
import axios from 'axios'

class PushStore {
  @observable pushMessages = []
  @observable isFetchingPushMessages = false
  @observable isUpdatingPushMessages = false
  @observable isDeletingPushMessages = false
  @observable isCreatingPushMessages = false

  @action
  reset() {
    this.title = this.content = this.photo = ''
  }

  @action
  createPushMessages = async body => {
    try {
      this.isCreatingPushMessages = true

      let {
        data: {
          data
        }
      } = await axios.post('/api/push_messages', body)
      
      this.fetchPushMessagess()
      this.isCreatingPushMessages = false
      return data.id
    } catch (err) {
      this.isCreatingPushMessages = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ ONE
  fetchOnePushMessages = async id => {
    try {
      this.isFetchingPushMessages = true
      let {
        data: {
          data
        }
      } = await axios.get(`/api/push_messages/${id}`)
      
      this.isFetchingPushMessages = false
      return data
    } catch (err) {
      this.isFetchingPushMessages = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ
  @action
  fetchPushMessagess = async () => {
    try {
      this.isFetchingPushMessages = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/push_messages')

      this.pushMessages = data
      this.isFetchingPushMessages = false
    } catch (err) {
      this.isFetchingPushMessages = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //UPDATE
  @action
  updatePushMessages = async (id, body) => {
    try {
      this.isUpdatingPushMessages = true

      await axios.patch(`/api/push_messages/${id}`, body)
      this.fetchPushMessagess()
      this.isUpdatingPushMessages = false
    } catch (err) {
      this.isUpdatingPushMessages = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //DELETE
  deletePushMessages = async id => {
    try {
      this.isDeletingPushMessages = true

      await axios.delete(`/api/push_messages/${id}`)

      this.isDeletingPushMessages = false
    } catch (err) {
      this.isDeletingPushMessages = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  isValidYoutubeURL = url => {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
    if(url.match(p)){
        return url.match(p)[1]
    }
    return false
  }
}

export default window.pushStore = new PushStore()