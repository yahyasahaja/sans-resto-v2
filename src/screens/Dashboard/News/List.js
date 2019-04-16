import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { observer } from 'mobx-react'
import { observe, observable } from 'mobx'
import Table from '../../../components/EnhancedTable'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import axios from 'axios'

import styles from './css/list.module.scss'
import { user, snackbar, floatingButton, overlayLoading } from '../../../services/stores'

//STORAGE
import newsStore from './newsStore'

const ROWS = [
  { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  { id: 'updated_at', numeric: false, disablePadding: false, label: 'Last Updated' },
]

const ROWS_PER_PAGE = 10


@observer
class News extends Component {
  @observable page = 0
  @observable order = 'asc'
  @observable orderBy = ''
  @observable isEditModalActive = false
  @observable search = ''
  @observable filter = 'all'
  @observable isNew = false
  @observable shouldShowPassword = false
  @observable selected = []
  @observable isDeleteDialogActive = false

  componentDidMount() {
    floatingButton.onClick = () => {
      newsStore.reset()
      this.props.history.push('/dashboard/news/new')
    }
    floatingButton.show()

    if (user.isLoggedIn) if (newsStore.news.length === 0) newsStore.fetchNews()
    this.userDisposer = observe(user, 'data', () => {
      // console.log('berubah?')
      if (user.isLoggedIn) if (newsStore.news.length === 0) newsStore.fetchNews()
    })
  }

  componentWillUnmount() {
    if (this.userDisposer) this.userDisposer()
    floatingButton.hide()
  }

  onRequestSort = id => {
    const orderBy = id
    let order = 'desc'

    if (this.orderBy === id && this.order === 'desc') {
      order = 'asc'
    }

    // this.setState({ order, orderBy })
    this.order = order
    this.orderBy = orderBy

    console.log('will be sorted by', this.orderBy, this.order)
  }

  renderContent = () => {
    return (
      <div className={styles.container} >
        <Table 
          rows={ROWS} 
          order={this.order}
          orderBy={this.orderBy}
          title="News"
          onRequestSort={this.onRequestSort}
          rowsPerPage={ROWS_PER_PAGE}
          onRowClick={async id => {
            this.props.history.push(`/dashboard/news/${id}`)
          }}
          onDelete={() => {
            if (this.selected.length > 0) this.isDeleteDialogActive = true
          }}
          path="/api/news"
          filterName="title"
          setRefetch={refetch => this.refetch = refetch}
          selected={this.selected}
        />
      </div>
    )
  }

  refetch = () => {}

  onDelete = async () => {
    try {
      overlayLoading.show()
      let toBeDeleted = this.selected.slice()
      for (let id of toBeDeleted) await newsStore.deleteNews(id)
      snackbar.show(`${toBeDeleted.length} news deleted`)
      await this.refetch()
    } catch (err) {
      snackbar.show('There\'s an error occured')
      console.log('ERROR WHILE DELETING NEWS', err)
    }

    this.selected = []
    overlayLoading.hide()
    this.isDeleteDialogActive = false
  }

  render() {
    if (!user.isLoggedIn) return <CircularProgress className={styles.loading} />

    return (
      <div className={styles.container} >
        {
          newsStore.isFetchingNews
            ? <CircularProgress className={styles.loading} />
            : this.renderContent()
        }

        <Dialog
          open={this.isDeleteDialogActive}
          onClose={() => this.isDeleteDialogActive = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Delete User
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete {this.selected.length} news?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isDeleteDialogActive = false} color="primary">
              Cancel
            </Button>
            <Button onClick={this.onDelete} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default News