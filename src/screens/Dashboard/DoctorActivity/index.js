import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import styles from './css/doctor-activity.module.scss'

import Doctors from './Doctors'
import Days from './Days'
import Schedule from './Schedule'

export default class DoctorActivity extends Component {
  render() {
    return (
      <div className={styles.container} >
        <Switch>
          <Route path="/dashboard/doctors/:doctor_id/:day" component={Schedule} />
          <Route path="/dashboard/doctors/:doctor_id" component={Days} />
          <Route path="*" component={Doctors} />
        </Switch>
      </div>
    )
  }
}
