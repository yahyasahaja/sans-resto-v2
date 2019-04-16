import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/new.module.scss'
import { snackbar } from '../../../services/stores'

//STORE
import trainingStore from './trainingStore'
import Navigation from '../../../components/Navigation'

@observer
class New extends Component {
  @observable file = null
  @observable title = ''
  @observable link = ''
  @observable description = ''
  @observable isCreatingTraining
  @observable nav = [
    {
      name: 'Training',
      url: '/dashboard/training'
    },
    {
      name: 'Create'
    }
  ]

  onSubmit = e => {
    e.preventDefault()
    if (!trainingStore.isValidYoutubeURL(this.link)) return snackbar.show('Invalid youtube link')
    this.save()
  }

  save = async () => {
    try {
      this.isCreatingTraining = true
      let id = await trainingStore.createTraining({
        title: this.title,
        link: this.link,
        description: this.description
      })

      this.props.history.push(`/dashboard/training`)
      snackbar.show('Training created')
    } catch (err) {
      this.isCreatingTraining = false
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
            value={this.description}
            multiline
            rows={5}
            onChange={e => {
              this.description = e.target.value
            }}
          />

          {
            this.isCreatingTraining
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
                  Create Video Training
                </Button>
              )
          }
        </form>
      </div>
    )
  }
}

export default New