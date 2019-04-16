import React, { Component } from 'react'

import styles from './css/report-card.module.scss'

export default class ReportCard extends Component {
  render() {
    let { number, title, icon, primaryColor } = this.props
    return (
      <div className={styles.container} style={{backgroundColor: primaryColor}} >
        <div className={styles.left} >
          <div className={styles.number} >{number}</div>
          <div className={styles.title} >{title}</div>
        </div>

        <div className={styles.right} >
          <div className={`mdi mdi-${icon} ${styles.icon}`} />
        </div>
      </div>
    )
  }
}
