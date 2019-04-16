import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import axios from 'axios'

import Table from './Table'
import { snackbar } from '../services/stores'
import styles from './css/enhanced-table.module.scss'

@observer
class EnhancedTable extends Component {
  //pagination
  @observable currentPage = 1
  @observable maxPage = 1
  @observable searchByName = ''
  @observable links = {}
  @observable data = []
  @observable meta = {}
  @observable filter = ''
  @observable isLoading = false
  @observable filters = []

  componentDidMount() {
    this.fetch()
    if (this.props.setRefetch) this.props.setRefetch(this.refetch)
    if (this.props.filters) this.filters = this.props.filters.map(d => ({...d, value: ''}))
  }

  refetch = async (shouldReset = false, useLoading = false) => {
    return await this.fetch(shouldReset ? 1 : this.currentPage, useLoading)
  }

  fetch = async (page = 1, useLoading = true) => {
    try {
      if (useLoading) this.isLoading = true
      let { path, filterName, processData, queryString } = this.props
      let searchParams = new URLSearchParams()
      searchParams.append('page', page)
      if (this.filter.length > 0) searchParams.append(filterName, this.filter)
      if (this.filters.length > 0) {
        for (let filter of this.filters) {
          if (filter.value.length > 0) searchParams.append(filter.id, filter.value)
        }
      }
      if (queryString) {
        for (let query of queryString) {
          for (let name in query) {
            searchParams.append(name, query[name])
          }
        }
      }

      let { 
        data: { 
          data, meta, links 
        } 
      } = await axios.get(`${path}?${searchParams.toString()}`)
      
      if (useLoading) this.isLoading = false
      if (processData) data = processData(data)
      this.data = data
      this.meta = meta 
      this.links = links
      return data
    } catch (err) {
      if (useLoading) this.isLoading = false
      snackbar.show('Error fetching data')
      console.log('ERROR WHILE FETCHING DATA', err)
    }
  }

  renderFilters() {
    let { filters } = this.props

    if (filters) {
      return filters.map((d, i) => {
        return (
          <TextField
            key={i}
            className={styles.search}
            variant="outlined"
            type="text"
            label={`Search by ${d.label}`}
            value={d.value}
            onChange={e => {
              // let filter = e.target.value
              this.currentPage = 1
              this.filters[i].value = e.target.value
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
        )
      })
    }

    return (
      <TextField
        className={styles.search}
        variant="outlined"
        type="text"
        label="Search Name"
        value={this.filter}
        onChange={e => {
          // let filter = e.target.value
          this.currentPage = 1
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
    )
  }

  render() {
    return (
      <div className={styles.container}>
        {this.renderFilters()}
        {this.props.enhancedMiddleComponent}
        <Table 
          links={this.links}
          isNextButtonDisabled={!!this.links.next}
          isPrevButtonDisabled={!!this.links.prev}
          page={this.currentPage}
          onNextButtonClicked={() => this.fetch(this.currentPage++)}
          onPrevButtonClicked={() => this.fetch(this.currentPage--)}
          onPageChange={page => {
            this.currentPage = page
            this.fetch(this.currentPage)
          }}
          isLoading={this.isLoading}
          data={this.data}
          meta={this.meta}
          {...this.props}
        />
      </div>
    )
  }
}

export default EnhancedTable