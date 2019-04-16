import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import CircularProgress from '@material-ui/core/CircularProgress'
import SendIcon from '@material-ui/icons/Send'

import styles from './css/new.module.scss'
import { snackbar } from '../../../services/stores'

//STORE
import pushStore from './pushStore'
import Navigation from '../../../components/Navigation'
import SelectableList from '../../../components/SelectableList'

@observer
class New extends Component {
  @observable title = ''
  @observable content = ''
  @observable isCreatingPushMessage
  @observable selectedCustomers = []
  @observable selectedDoctors = []
  @observable nav = [
    {
      name: 'Push Messages',
      url: '/dashboard/push'
    },
    {
      name: 'Create'
    }
  ]

  onSubmit = e => {
    e.preventDefault()
    this.push()
  }

  push = async () => {
    // return console.log(this.selectedCustomers.length)
    try {
      this.isCreatingPushMessage = true
      
      let id = await pushStore.createPushMessages({
        title: this.title,
        content: this.content,
        user_ids: [
          ...this.selectedCustomers.map(d => d.id), 
          ...this.selectedDoctors.map(d => d.id)
        ]
      })

      this.props.history.push(`/dashboard/push`)
      snackbar.show('Message Pushed')
    } catch (err) {
      this.isCreatingPushMessage = false
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
            label="Content"
            fullWidth
            margin="normal"
            variant="outlined"
            value={this.content}
            multiline
            rows={5}
            onChange={e => {
              this.content = e.target.value
            }}
          />
          
          <SelectableList 
            path="/api/customers"
            filterName="name"
            selecteds={this.selectedCustomers}
            name="customer"
          />

          <SelectableList 
            path="/api/doctors"
            filterName="name"
            selecteds={this.selectedDoctors}
            name="doctor"
          />

          {
            this.isCreatingPushMessage
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
                  Push Message
                  <SendIcon style={{marginLeft: 10, fontSize: 14}} />
                </Button>
              )
          }
        </form>
      </div>
    )
  }
}

export default New