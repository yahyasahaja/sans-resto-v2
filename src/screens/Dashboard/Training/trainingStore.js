import { observable, action } from 'mobx'
import axios from 'axios'

class TrainingStore {
  @observable trainings = []
  @observable isFetchingTraining = false
  @observable isUpdatingTraining = false
  @observable isDeletingTraining = false
  @observable isCreatingTraining = false

  @action
  reset() {
    this.title = this.content = this.photo = ''
  }

  @action
  createTraining = async body => {
    try {
      this.isCreatingTraining = true

      let {
        data: {
          data
        }
      } = await axios.post('/api/training_videos', body)
      
      this.fetchTrainings()
      this.isCreatingTraining = false
      return data.id
    } catch (err) {
      this.isCreatingTraining = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ ONE
  fetchOneTraining = async id => {
    try {
      this.isFetchingTraining = true
      let {
        data: {
          data
        }
      } = await axios.get(`/api/training_videos/${id}`)
      
      this.isFetchingTraining = false
      return data
    } catch (err) {
      this.isFetchingTraining = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //READ
  @action
  fetchTrainings = async () => {
    try {
      this.isFetchingTraining = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/training_videos')

      this.trainings = data
      this.isFetchingTraining = false
    } catch (err) {
      this.isFetchingTraining = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //UPDATE
  @action
  updateTraining = async (id, body) => {
    try {
      this.isUpdatingTraining = true

      await axios.patch(`/api/training_videos/${id}`, body)
      this.fetchTrainings()
      this.isUpdatingTraining = false
    } catch (err) {
      this.isUpdatingTraining = false
      console.log('ERROR WHILE FETCHING NEWS', err)
    }
  }

  //DELETE
  deleteTraining = async id => {
    try {
      this.isDeletingTraining = true

      await axios.delete(`/api/training_videos/${id}`)

      this.isDeletingTraining = false
    } catch (err) {
      this.isDeletingTraining = false
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

export default window.trainingStore = new TrainingStore()