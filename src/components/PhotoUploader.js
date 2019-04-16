import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import styles from './css/photo-uploader.module.scss'

@observer
class PhotoUploader extends Component {
  @observable file = null
  id = Date.now()

  render() {
    let {
      image
    } = this.props

    return (
      <div className={styles.image} >
        <input 
          style={{display: 'none'}}
          type="file" 
          name={this.id} 
          id={this.id} 
          onChange={e => {
            if (e.target.files.length > 0) {
              this.file = e.target.files[0]
              this.props.onChange && this.props.onChange(e.target.files[0])
            }
          }}
        />
        {image && <div
          onClick={() => {
            this.file = null
            this.props.onChange && this.props.onChange(null)
          }} 
          className={`mdi mdi-close ${styles.close}`} 
          />
        }
        <label htmlFor={this.id} className={styles.img} >
          {
            this.file || image
            ? (
              <img src={image} alt=""/>
            )
            : (
              <div className={styles.placeholder}>
                <span className={`mdi mdi-plus ${styles.icon}`} />
                <span>Add Image</span>
              </div>
            )
          }
        </label>
      </div>
    )
  }
}

export default PhotoUploader