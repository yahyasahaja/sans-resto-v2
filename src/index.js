import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Router from './App'
import * as serviceWorker from './serviceWorker'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import lightBlue from '@material-ui/core/colors/lightBlue'

const MUITheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00afc6'
    },
    secondary: red,
  },
  typography: {
    useNextVariants: true,
  }
})

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={MUITheme}>
        <Router />
      </MuiThemeProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
