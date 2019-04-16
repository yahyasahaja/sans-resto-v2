import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { observable, action, observe } from 'mobx'
import { observer } from 'mobx-react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
// import Divider from '@material-ui/core/Divider'

import styles from './css/dashboard.module.scss'

//WRAPPER
import Wrapper from './Wrapper'

//ROUTERS
import Membership from './Membership'
import Categories from './Categories'
import Reservation from './Reservation'
import { user, token } from '../../services/stores'
import DoctorActivity from './DoctorActivity'
import News from './News'
import Training from './Training'
import PushMessage from './PushMessage'
import Home from './Home'
import Admin from './Admin'
import AdminProfile from './AdminProfile'

const ROUTER = [
  {
    title: 'Home',
    path: '/dashboard/home',
    icon: 'home',
    Component: Home
  },
  {
    title: 'Membership',
    path: '/dashboard/membership',
    icon: 'account-group',
    Component: Membership
  },
  {
    title: 'Categories',
    path: '/dashboard/categories',
    icon: 'account-details',
    Component: Categories
  },
  {
    title: 'Reservation',
    path: '/dashboard/reservation',
    icon: 'calendar-text',
    Component: Reservation
  },
  {
    title: 'Push Messages',
    path: '/dashboard/push',
    icon: 'send',
    Component: PushMessage
  },
  {
    title: 'Doctor Activity',
    path: '/dashboard/doctors',
    icon: 'doctor',
    Component: DoctorActivity
  },
  {
    title: 'Training',
    path: '/dashboard/training',
    icon: 'video',
    Component: Training
  },
  {
    title: 'News',
    path: '/dashboard/news',
    icon: 'newspaper',
    Component: News
  },
  {
    title: 'Admin',
    path: '/dashboard/admin',
    icon: 'account-tie',
    Component: Admin
  },
]

@observer
class Dashboard extends Component {
  @observable anchorElement = null
  @observable isIn = false
  @observable selected = -1

  componentDidMount() {
    setTimeout(() => {
      this.isIn = true
    }, 100)

    if (!token.isSettingUp && !user.isLoggedIn) return this.props.history.push('/auth/login')
    this.tokenDisposer = observe(token, 'isSettingUp', () => {
      if (!token.isSettingUp && !user.isLoggedIn) this.props.history.push('/auth/login')
    })

    for (let i in ROUTER) 
      if (window.location.pathname.indexOf(ROUTER[i].path) !== -1) this.selected = Number(i)
  }

  componentWillUnmount() {
    if (this.tokenDisposer) this.tokenDisposer()
  }

  @action
  closeMenu = () => {
    this.anchorElement = null
  }

  render() {
    return (
      <div className={styles.container} >
        <div 
          className={styles.top} 
          style={{animationName: this.isIn ? styles.topDown : ''}} 
        >
          <Avatar
            onClick={e => this.anchorElement = e.currentTarget}
          >
            <AccountCircle />
          </Avatar>
          <Menu
            id="simple-menu"
            anchorEl={this.anchorElement}
            open={!!this.anchorElement}
            onClose={this.closeMenu}
          >
            <MenuItem onClick={() => {
              this.closeMenu()
              this.props.history.push('/dashboard/profile')
            }}>Edit Profile</MenuItem>
            <MenuItem onClick={() => {
              user.logout()
              this.closeMenu()
              this.props.history.push('/login')
            }}>Logout</MenuItem>
          </Menu>
        </div>

        <div 
          className={styles.nav} 
          style={{animationName: this.isIn ? styles.leftRight : ''}} 
        >
          <div className={styles.logo} >
            <img src="/image/logo.png" alt=""/>
          </div>
          {/* <Divider /> */}
          <List component="nav" className={styles.list}>
            {ROUTER.map((d, i) => {
              return (
                <ListItem 
                  className={this.selected === i ? styles.selected : ''}
                  selected={this.selected === i} key={i} button onClick={() => {
                  this.selected = i
                  this.props.history.push(d.path)
                }}>
                  <ListItemIcon>
                    <span className={`mdi mdi-${d.icon} ${styles.icon}`} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={d.title} 
                  />
                </ListItem>
              )
            })}
          </List>
        </div>
        
        {/* <div className={styles.shadow} /> */}

        <div className={styles.wrapper}>
          {ROUTER.map((d, i) => 
            <Route 
              path={d.path} 
              key={i} 
              render={props => (
                  <Wrapper {...props}>
                    <d.Component {...props} />
                  </Wrapper>
                )
              }
            />
          )}
          <Route 
            path="/dashboard/profile" 
            render={props => (
                <Wrapper {...props}>
                  <AdminProfile {...props} />
                </Wrapper>
              )
            }
          />
        </div>
      </div>
    )
  }
}

export default Dashboard