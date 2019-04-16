import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable, toJS } from 'mobx'
import styles from './css/days.module.scss'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
// import Avatar from '@material-ui/core/Avatar'
// import ImageIcon from '@material-ui/icons/Image'

import Navigation from '../../../components/Navigation'
import { doctor } from '../../../services/stores'
// import axios from 'axios'

@observer
class Days extends Component {
  @observable nav = [
    {
      name: 'Doctors',
      url: '/dashboard/doctors'
    }
  ]
  @observable user = null

  async componentDidMount() {
    let id = this.props.match.params.doctor_id

    if (doctor.doctor) {
      this.nav.push({
        name: doctor.doctor.name,
      })
    } else {
      this.nav.push({
        name: (await doctor.fetchDoctor(id)).name
      })
    }
  }

  days = [ 
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]
  
  renderContent() {
    let id = this.props.match.params.doctor_id
    // let state = toJS(this.user)

    // console.log(state)

    // if (this.props.location.state) state = this.props.location.state

    return (
      <List className={styles.list}>
        {this.days.map((day, i) => {
          return (
            <ListItem button key={i} onClick={() => {
              this.props.history.push(
                `/dashboard/doctors/${id}/${day}`
              )
            }} >
              <ListItemText 
                primary={day} 
              />
            </ListItem>
          )
        })}
      </List>
    )
  }

  render() {
    // console.log('render', this.nav.slice())
    return (
      <div className={styles.container} >
        <Navigation data={this.nav.slice()} />
        {this.renderContent()}
      </div>
    )
  }
}

export default Days