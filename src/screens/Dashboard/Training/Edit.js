import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/new.module.scss'

//STORE
import trainingStore from './trainingStore'
import { snackbar } from '../../../services/stores'
import Navigation from '../../../components/Navigation'

@observer
class Edit extends Component {
  @observable file = null
  @observable title = ''
  @observable link = ''
  @observable description = ''
  @observable nav = [
    {
      name: 'Training',
      url: '/dashboard/training'
    },
  ]

  async componentDidMount() {
    let training = await trainingStore.fetchOneTraining(this.props.match.params.id)
    if (!training) return 
    this.title = training.title
    this.link = training.link
    this.description = training.description
    this.nav.push({
      name: this.title
    })
  }

  onSubmit = e => {
    e.preventDefault()
    if (!trainingStore.isValidYoutubeURL(this.link)) return snackbar.show('Invalid youtube link')
    this.save()
  }

  save = async () => {
    try {
      this.isUpdatingTraining = true
      await trainingStore.updateTraining(this.props.match.params.id, {
        title: this.title,
        link: this.link,
        description: this.description
      })

      snackbar.show('Training updated')
      this.isUpdatingTraining = false
    } catch (err) {
      this.isUpdatingTraining = false
      snackbar.show('There\'s an error occured, try again later')
      console.log('ERROR WHILE UPLOADING FILE', err)
    }
  }

  render() {
    return (
      <div className={styles.container} >
        <Navigation data={this.nav.slice()} />
        <form onSubmit={this.onSubmit}>
        <TextField
            label="Title"
            fullWidth
            margin="normal"
            variant="outlined"
            value={this.title}
            onChange={e => {
              this.title = e.target.value
            }}
          />
          <TextField
            label="Youtube Link"
            fullWidth
            margin="normal"
            variant="outlined"
            value={this.link}
            onChange={e => {
              this.link = e.target.value
            }}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            variant="outlined"
            value={this.description || ''}
            multiline
            rows={5}
            onChange={e => {
              this.description = e.target.value
            }}
          />

          {
            this.isUpdatingTraining
              ? (
                <CircularProgress className={styles.loading} />
              )
              : (
                <Button 
                  fullWidth
                  variant="contained" 
                  color="primary" 
                  className={styles.button}
                  type="submit"
                >
                  Update Video Training
                </Button>
              )
          }
        </form>
      </div>
    )
  }
}

export default Edit