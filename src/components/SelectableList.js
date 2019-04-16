import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import ListItemText from '@material-ui/core/ListItemText'
import axios from 'axios'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/selectable-list.module.scss'

@observer
class SelectableList extends Component {
  //pagination
  @observable currentPage = 1
  @observable maxPage = 1
  @observable searchByName = ''
  @observable links = {}
  @observable data = []
  @observable meta = {}
  @observable filter = ''
  @observable isLoading = false
  @observable selecteds = []
  @observable isFetchDisabled = false

  componentDidMount() {
    this.fetch()
    if (this.props.setRefetch) this.props.setRefetch(this.refetch)
    this.setScrollListener(true)
  }

  componentWillUnmount() {
    this.setScrollListener(false)
  }

  refetch = async (shouldReset = false, useLoading = false) => {
    return await this.fetch(shouldReset ? 1 : this.currentPage, useLoading)
  }

  fetch = async (page = 1, useLoading = true) => {
    try {
      if (useLoading) this.isLoading = true
      let { path, filterName, processData } = this.props
      let searchParams = new URLSearchParams()
      searchParams.append('page', page)
      if (this.filter.length > 0) searchParams.append(filterName, this.filter)

      let { 
        data: { 
          data, meta, links 
        } 
      } = await axios.get(`${path}?${searchParams.toString()}`)
      
      if (useLoading) this.isLoading = false
      if (processData) data = processData(data)
      this.data = [...this.data, ...data]
      this.meta = meta 
      this.links = links
      if (meta.current_page === meta.last_page) this.isFetchDisabled = true
      return data
    } catch (err) {
      if (useLoading) this.isLoading = false
      console.log('ERROR WHILE FETCHING DATA', err)
    }
  }

  setScrollListener(add) {
    if (add) {
      this.container.addEventListener('scroll', this.checkScroll)
      this.container.addEventListener('gesturechange', this.checkScroll)
    } else {
      this.container.removeEventListener('scroll', this.checkScroll)
      this.container.removeEventListener('gesturechange', this.checkScroll)
    }
  }

  checkScroll = () => {
    if (this.isLoading) return

    let scrollPosition = this.container.scrollTop
    let pageHeight = this.container.scrollHeight
    let screenHeight = this.container.offsetHeight

    // console.log('scroll position', scrollPosition)
    // console.log('page height', pageHeight)
    // console.log('screen height', screenHeight)
    // console.log(scrollPosition < pageHeight - screenHeight - screenHeight * 0.5)

    if (scrollPosition < pageHeight - screenHeight - screenHeight * 0.5) return
    
    if (!this.isFetchDisabled) {
      this.fetch(++this.currentPage)
    }
  }

  checkIsSelected(data) {
    let { selecteds } = this.props
    selecteds = selecteds || this.selecteds
    
    for (let i in selecteds) if (selecteds[i].id === data.id) return i 
  }
  
  render() {
    let { selecteds, singleSelection } = this.props
    selecteds = selecteds || this.selecteds

    return (
      <Paper>
        <div className={styles.container} >
          <div className={styles['search-container']} >
            <TextField
              className={styles.search}
              variant="outlined"
              type="text"
              label={`Search ${this.props.name} ${this.props.filterName}`}
              value={this.filter}
              fullWidth
              onChange={e => {
                // let filter = e.target.value
                this.currentPage = 1
                this.data = []
                this.filter = e.target.value
                this.fetch()
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      // onClick={this.handleClickShowPassword}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className={styles.list} ref={el => this.container = el} >
            <List >
              {this.data.map((d, i) => {
                let isSelected = this.checkIsSelected(d)
                return (
                  <ListItem 
                    className={!!isSelected ? styles.selected : ''}
                    selected={!!isSelected} key={i} button onClick={() => {
                      if (!isSelected) {
                        if (singleSelection) {
                          if (selecteds.length >= 1) return
                        }
                        
                        selecteds.push(d)
                      } else selecteds.splice(isSelected, 1)
                  }}>
                    <ListItemText 
                      primary={d.name} 
                    />
                  </ListItem>
                )
              })}
              {this.isLoading && <CircularProgress className={styles.loading} />}
            </List>
          </div>

          <div className={styles.summary} >
            {selecteds.length} items selected
          </div>
        </div>
      </Paper>
    )
  }
}

export default SelectableList
