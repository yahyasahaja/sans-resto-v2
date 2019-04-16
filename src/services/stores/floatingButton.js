import { observable, action } from 'mobx'

class FloatingButton {
  @observable isActive = false 
  onClick = () => {}

  show() {
    this.isActive = true
  }

  hide() {
    this.isActive = false
  }
}

export default new FloatingButton()