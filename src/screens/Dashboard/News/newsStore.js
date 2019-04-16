import { observable, computed, action } from 'mobx'
import axios from 'axios'
import { reset } from 'ansi-colors';

class NewsStore {
  @observable news = []
  @observable isFetchingNews = false
  @observable isUpdatingNews = false
  @observable isDeletingNews = false
  @observable isCreatingNews = false

  @action
  reset() {
    this.title = this.content = this.photo = ''
  }

  @action
  createNews = async body => {
    try {
      this.isCreatingNews = true

      let {
        data: {
          data
        }
      } = await axios.post('/api/news', body)
      
      this.fetchNews()
      this.isCreatingNews = false
      return data.id
    } catch (err) {
      this.isCreatingNews = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ ONE
  fetchOneNews = async id => {
    try {
      this.isFetchingNews = true
      let {
        data: {
          data
        }
      } = await axios.get(`/api/news/${id}`)
      
      this.isFetchingNews = false
      return data
    } catch (err) {
      this.isFetchingNews = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ
  @action
  fetchNews = async () => {
    try {
      this.isFetchingNews = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/news')

      this.news = data
      this.isFetchingNews = false
    } catch (err) {
      this.isFetchingNews = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //UPDATE
  @action
  updateNews = async (id, body) => {
    try {
      this.isUpdatingNews = true
      await axios.patch(`/api/news/${id}`, body)
      this.fetchNews()
      this.isUpdatingNews = false
    } catch (err) {
      this.isUpdatingNews = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //DELETE
  deleteNews = async id => {
    try {
      this.isDeletingNews = true

      await axios.delete(`/api/news/${id}`)
      this.isDeletingNews = false
    } catch (err) {
      this.isDeletingNews = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }
}

export default window.newsStore = new NewsStore()