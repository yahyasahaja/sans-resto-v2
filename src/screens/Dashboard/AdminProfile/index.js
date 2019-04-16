import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { observer } from 'mobx-react'
import { observable, observe } from 'mobx'
import CircularProgress from '@material-ui/core/CircularProgress'
import axios from 'axios'

import styles from './css/admin-profile.module.scss'
import { user } from '../../../services/stores'

@observer
class AdminProfile extends Component {
  @observable name = ''
  @observable email = ''
  @observable password = ''
  @observable isLoading = false
  @observable shouldShowPassword = false

  componentDidMount() {
    if (user.data) {
      this.name = user.data.name
      this.email = user.data.email
      // this.password = user.data.password
    }

    this.userDisposer = observe(user, 'data', () => {
      if (!user.data) return
      this.name = user.data.name
      this.email = user.data.email
      // this.password = user.data.password
    })
  }

  componentWillUnmount() {
    if (this.userDisposer) this.userDisposer()
  }
  
  handleChange(name, value) {
    this[name] = value
  }

  save = async () => {
    let {
      name,
      email,
      password,
    } = this

    try {
      this.isLoading = true
      await axios.patch(`/api/users/${user.data.id}`, {
        name, email, password
      })

      user.data.name = this.name
      user.data.email = this.email

      this.isLoading = false
    } catch (err) {
      this.isLoading = false
      console.log('ERROR WHILE SAVING ADMIN PROFILE', err)
    }
  }

  render() {
    return (
      <div className={styles.container} >
        <form onSubmit={e => {
          e.preventDefault()
          this.save()
        }}>
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.handleChange('name', e.target.value)}
          value={this.name}
          type="text"
        />
        <TextField
          label="Email"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.handleChange('email', e.target.value)}
          value={this.email}
          type="email"
        />
        <TextField
          className={styles.password}
          variant="outlined"
          type={this.shouldShowPassword ? 'text' : 'password'}
          label="Password"
          value={this.password}
          onChange={e => this.handleChange('password', e.target.value)}
          margin="dense"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={() => this.shouldShowPassword = !this.shouldShowPassword}
                >
                  {this.shouldShowPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {
          this.isLoading
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

export default AdminProfile