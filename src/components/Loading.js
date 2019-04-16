import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/loading.module.scss'

export default class Loading extends Component {
  render() {
    let {cube, circular, wrapped = true} = this.props

    return (
      <div>
        <div className={!wrapped ? '' : styles.container + ' ' + styles.anim}>   
        <div className={!wrapped ? '' : styles.wrapper}>
        { 
          cube 
            ? (
              <div id="cube-loading" className="sk-cube-grid">
                <div className="sk-cube sk-cube1"></div>
                <div className="sk-cube sk-cube2"></div>
                <div className="sk-cube sk-cube3"></div>
                <div className="sk-cube sk-cube4"></div>
                <div className="sk-cube sk-cube5"></div>
                <div className="sk-cube sk-cube6"></div>
                <div className="sk-cube sk-cube7"></div>
                <div className="sk-cube sk-cube8"></div>
                <div className="sk-cube sk-cube9"></div>
              </div>
            )
            : circular ? 
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <div className="loader"></div>
                  <div className="loader2"></div>
                  <div className="loader3"></div>
                </div>
            : 
              <CircularProgress type='circular' />
        }
        </div>
        </div>
      </div>
    )
  }
}
