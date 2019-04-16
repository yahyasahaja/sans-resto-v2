import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable, observe } from 'mobx'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Button from '@material-ui/core/Button'
// import Icon from '@material-ui/core/Icon'
import SendIcon from '@material-ui/icons/Send'

import styles from './css/login.module.scss'
import CircularProgress from '@material-ui/core/CircularProgress'
import { user, token } from '../../services/stores'

@observer
class Login extends Component {
  @observable shouldShowPassword = false
  @observable email = ''
  @observable password = ''
  @observable isIn = false
  @observable isOut = false

  componentDidMount() {
    setTimeout(() => {
      this.isIn = true
    }, 100)

    if (user.isLoggedIn) return this.props.history.push('/dashboard/home')
    this.tokenDisposer = observe(token, 'isSettingUp', () => {
      if (!token.isSettingUp && user.isLoggedIn) this.props.history.push('/dashboard/home')
    })
  }

  componentWillUnmount() {
    if (this.tokenDisposer) this.tokenDisposer()
  }

  handleChange(name, value) {
    this[name] = value.target.value
  }

  handleClickShowPassword = () => {
    this.shouldShowPassword = !this.shouldShowPassword
  }

  renderButton() {
    if (user.isLoadingLogin) return <CircularProgress className={styles.loading} /> 

    return (
      <Button 
        fullWidth 
        size="large"
        variant="contained" 
        color="primary"
        style={{marginTop: 20, color: 'white'}}
        type="submit"
      >
        Send
        {/* This Button uses a Font Icon, see the installation instructions in the docs. */}
        <SendIcon style={{marginLeft: 10}} />
      </Button>
    )
  }

  onSubmit = async e => {
    e.preventDefault()

    //login 
    let token = await user.login(this.email, this.password)
    
    if (token) {
      this.gotoDashboard()
    }
  }

  gotoDashboard() {
    this.isOut = true
    setTimeout(() => this.props.history.push('/dashboard'), 600)
  }

  render() {
    if (token.isSettingUp) return (
      <div className={styles['loading-wrapper']} >
        <CircularProgress className={styles.loading} /> 
      </div>
    )

    return (
      <div className={styles.container} >
        <form 
          className={styles.wrapper} 
          onSubmit={this.onSubmit} 
          style={{animationName: this.isOut ? styles.bottomUp : this.isIn ? styles.topDown : ''}}
        >
          <div className={styles.logo} >
            <img src="/image/logo.png" alt=""/>
          </div>

          <TextField
            name="email"
            type="email"
            label="Email"
            className={styles.input}
            onChange={this.handleChange.bind(this, 'email')}
            value={this.email}
            fullWidth
            rowsMax={6}
            required
            margin="normal"
            variant="outlined"
          />

          <div className={styles['password-wrapper']}>
            <TextField
              name="password"
              type={this.shouldShowPassword ? 'text' : 'password'}
              label="Password"
              className={styles.password}
              onChange={this.handleChange.bind(this, 'password')}
              value={this.password}
              required
              fullWidth
              autoComplete="current-password"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowPassword}
                    >
                      {this.shouldShowPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {this.renderButton()}
        </form>
      </div>
    )
  }
}

export default Login