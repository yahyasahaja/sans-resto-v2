import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CKEditor from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import axios from 'axios'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/new.module.scss'

//STORE
import newsStore from './newsStore'
import PhotoUploader from '../../../components/PhotoUploader'
import { snackbar } from '../../../services/stores'
import Navigation from '../../../components/Navigation'

@observer
class New extends Component {
  @observable file = null
  @observable title = ''
  @observable content = ''
  @observable photo = ''
  @observable isCreatingNews = false
  @observable nav = [
    {
      name: 'News',
      url: '/dashboard/news'
    },
    {
      name: 'Create'
    }
  ]

  onSubmit = e => {
    e.preventDefault()
    console.log('kepanggil')
    if (!this.photo || (this.photo && this.photo.length == 0)) 
      return snackbar.show('News photo is required') 

    if (this.title.length == 0) return snackbar.show('News title is required')
    this.save()
  }

  save = async () => {
    try {
      this.isCreatingNews = true
      if (
        this.prevImage != this.photo &&
        this.photo != null && 
        this.photo.length > 0
      ) await this.upload()

      let id = await newsStore.createNews({
        title: this.title,
        content: this.content,
        photo: this.photo
      })

      this.props.history.push(`/dashboard/news`)
      snackbar.show('News created')
    } catch (err) {
      this.isCreatingNews = false
      snackbar.show('There\'s an error occured, try again later')
      console.log('ERROR WHILE UPLOADING FILE', err)
    }
  }

  upload = async () => {
    let formData = new FormData()
    formData.append('photo', this.file)

    let {
      data: {
        data: photo
      }
    } = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    this.photo = photo
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

          <CKEditor
            config={{
              height: 500
            }}
            editor={ ClassicEditor }
            data={this.content}
            onInit={ editor => {
              // You can store the "editor" and use when it is needed.
            } }
            onChange={ ( event, editor ) => {
              this.content = editor.getData()
            } }
          />

          <PhotoUploader 
            image={this.photo}
            onChange={file => {
              this.file = file
              this.photo = file ? URL.createObjectURL(file) : null
            }}
          />

          {
            this.isCreatingNews
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
                  Create News
                </Button>
              )
          }
        </form>
      </div>
    )
  }
}

export default New