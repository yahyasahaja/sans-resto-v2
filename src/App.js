import React, { Component, Suspense } from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import LoadingPage from './screens/Loading'
import CircularProgress from '@material-ui/core/CircularProgress'
import styles from './App.module.scss'
import axios from 'axios'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { BASE_URL } from './config'
// import user from './services/stores/user'
import { 
  // Button, 
  // Dialog, 
  // DialogTitle, 
  // DialogContent, 
  // DialogContentText, 
  // DialogActions,
  Snackbar,
  // CircularProgress 
} from '@material-ui/core'

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { snackbar, token, overlayLoading, floatingButton } from './services/stores'
import { observer } from 'mobx-react'

const Login = React.lazy(
  () => import(/*webpackChunkName: "Login"*/ './screens/Auth/Login')
)
const Dashboard = React.lazy(
  () => import(/*webpackChunkName: "Dashboard"*/ './screens/Dashboard')
)

axios.defaults.baseURL = BASE_URL
axios.defaults.headers['Accept'] = 'application/json'
axios.defaults.headers['Content-Type'] = 'application/json'

@observer
class App extends Component {
  async componentDidMount() {
    await token.setup()
    // snackbar.show('abc')
  }

  renderOverlayLoading() {
    if (overlayLoading.isActive)
      return (
        <section>
          <div className={styles.loading}>
            <div className={styles.loading2}>
              <CircularProgress style={{color: '#fff'}} />
            </div>
          </div>
        </section>
      )
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.shadow} />
        <Suspense fallback={<LoadingPage />} >
          <BrowserRouter>
            <Switch>
              <Route path="/auth/login" render={props => <Login {...props} />} />
              <Route path="/dashboard/*" render={props => <Dashboard {...props} />} />
              <Redirect from="/dashboard" to="/dashboard/home" />
              <Redirect from="/" to="/auth/login" />
            </Switch>
          </BrowserRouter>
        </Suspense>

        <section>
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
            open={snackbar.data.active}
            autoHideDuration={snackbar.data.timeout}
            message={snackbar.data.label}
            onClose={() => snackbar.hide()}
            data-cy="snackbar"
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.closeSnackbar}
              >
                <CloseIcon data-cy="snackbar-close-btn" />
              </IconButton>,
            ]}
          />
        </section>
        <section>
          <div className={styles.add} >
            <Fab 
              style={{display: floatingButton.isActive ? 'inline-flex' : 'none'}}
              onClick={floatingButton.onClick}
              color="primary" aria-label="Add" 
              className={styles.fab}>
              <AddIcon />
            </Fab>
          </div>
        </section>
        {this.renderOverlayLoading()}
      </div>
    )
  }
}

export default App