import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import styles from './css/wrapper.module.scss'

@observer
class Wrapper extends Component {
  @observable activeAnim = false

  componentDidMount() {
    setTimeout(() => this.activeAnim = true, 100)
  }

  render() {
    return (
      <div 
        style={{animationName: this.activeAnim ? styles.zoom : ''}} 
        className={styles.container} >
        {this.props.children}
      </div>
    )
  }
}

export default Wrapper