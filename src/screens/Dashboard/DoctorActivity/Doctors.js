import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
// import { observable } from 'mobx'
import { observer } from 'mobx-react'
// import axios from 'axios'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import ImageIcon from '@material-ui/icons/Image'
// import WorkIcon from '@material-ui/icons/Work'
// import BeachAccessIcon from '@material-ui/icons/BeachAccess'

import styles from './css/doctors.module.scss'
import doctorStore from '../../../services/stores/doctor'

@observer
class Doctors extends Component {
  componentDidMount() {
    doctorStore.fetchDoctors()
  }

  renderContent() {
    if (doctorStore.isFetchingDoctors) 
      return <CircularProgress className={styles.loading} />

    return (
      <List className={styles.list}>
        {doctorStore.doctors.map((doctor, i) => {
          return (
            <ListItem button key={i} onClick={() => {
              doctorStore.doctor = doctor
              this.props.history.push(
                `/dashboard/doctors/${doctor.id}`
              )
            }} >
              <Avatar>
                <ImageIcon />
              </Avatar>
              <ListItemText 
                primary={doctor.name} 
                secondary={doctor.banned ? 'Inactive' : 'Active'} 
              />
            </ListItem>
          )
        })}
      </List>
    )
  }

  render() {
    return (
      <div className={styles.container} >
        {this.renderContent()}
      </div>
    )
  }
}

export default Doctors