/*
USAGE
props.data = [
  {
    name: "doctors",
    url: "/doctor"
  }
]
*/

import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import styles from './css/navigation.module.scss'

class Navigation extends Component {
  render() {
    return (
      <div className={styles.container} >
        {
          this.props.data.map((data, i) => {
            return (
              <div key={i} className={styles.nav} onClick={() => {
                if (data.url && data.url.length > 0) this.props.history.push(data.url)
              }}>
                <div className={`${styles.icon} mdi mdi-chevron-right`} />
                <div className={styles.name} >{data.name}</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default withRouter(Navigation)