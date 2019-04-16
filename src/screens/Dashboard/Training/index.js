//MODULES
import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

//STYLES
import styles from './css/index-training.module.scss'

//ROUTE
import List from './List'
import New from './New'
import Edit from './Edit'

//News
class News extends Component {
  render() {
    return (
      <div className={styles.container} >
        <Switch>
          <Route path="/dashboard/training/new" component={New} />
          <Route path="/dashboard/training/:id" component={Edit} />
          <Route path="/dashboard/training" component={List} />
        </Switch>
      </div>
    )
  }
}

export default News