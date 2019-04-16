import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import Table from '../../../components/EnhancedTable'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Switch from '@material-ui/core/Switch'
// import DialogContentText from '@material-ui/core/DialogContentText'
import MenuItem from '@material-ui/core/MenuItem'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import axios from 'axios'
import InputAdornment from '@material-ui/core/InputAdornment'
// import SearchIcon from '@material-ui/icons/Search'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
// import Paper from '@material-ui/core/Paper'

import styles from './css/membership.module.scss'
import { user, snackbar, overlayLoading, floatingButton } from '../../../services/stores'

const ROWS = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'gender', numeric: false, disablePadding: false, label: 'Gender' },
  { 
    id: 'banned', 
    numeric: false, 
    disablePadding: false, 
    label: 'Banned',
    disablePropagation: true 
  },
]

const ROWS_PER_PAGE = 10

@observer
class Membership extends Component {
  @observable users = []
  @observable page = 0
  @observable order = 'asc'
  @observable orderBy = ''
  //dialog edit
  @observable isEditModalActive = false
  @observable title = ''
  @observable id = -1
  @observable name = ''
  @observable email = ''
  @observable role = 'admin'
  @observable age = ''
  @observable phone = ''
  @observable gender = ''
  @observable isFetchingUser = false
  @observable search = ''
  @observable filter = 'all'
  @observable isNew = false
  @observable shouldShowPassword = false
  @observable password = ''
  @observable selected = []
  @observable isDeleteDialogActive = false
  @observable tab = 0

  componentDidMount() {
    floatingButton.onClick = () => {
      this.reset()
      this.isNew = true
      this.isEditModalActive = true
    }
    floatingButton.show()

    // if (user.isLoggedIn) this.fetchUsers()
    // this.userDisposer = observe(user, 'data', () => {
    //   // console.log('berubah?')
    //   if (user.isLoggedIn) this.fetchUsers()
    // })
  }

  componentWillUnmount() {
    // if (this.userDisposer) this.userDisposer()
    floatingButton.hide()
  }

  async fetchUsers() {
    let users = await user.getUsers(this.currentPage, {name: this.searchByName})
    if (!users) return

    // console.log('hasil', users)
    this.users = users
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

  @action
  async getUserById(id) {
    try {
      this.isFetchingUser = true
      this.reset()
      let { data: { data } } = await axios.get(`/api/users/${id}`)
      this.isFetchingUser = false
      for (let loc in data) this[loc] = data[loc]
      if (this.customer) for (let loc in this.customer) this[loc] = this.customer[loc]
      if (this.doctor) for (let loc in this.doctor) this[loc] = this.doctor[loc]
      return data
    } catch (err) {
      this.isFetchingUser = false
      snackbar.show('There is an error occured')
      console.log('Error fetching user with id', id)
    }
  }

  renderContent() {
    return (
      <div className={styles.container} >
        {this.renderCustomerTable()}
        {this.renderDoctorTable()}
      </div>
    )
  }

  renderCustomerTable() {
    return (
      <div className={styles.table} style={{display: this.tab === 0 ? 'block' : 'none'}} >
        <Table 
          rows={ROWS} 
          order={this.order}
          orderBy={this.orderBy}
          onRequestSort={this.onRequestSort}
          rowsPerPage={ROWS_PER_PAGE}
          onRowClick={async id => {
            this.isNew = false
            this.isEditModalActive = true
            await this.getUserById(id)
          }}
          onDelete={selected => {
            if (this.selected.length === 0) return
            this.isDeleteDialogActive = true
          }}
          path="/api/customers"
          filterName="name"
          title="Membership"
          middleComponent={this.renderTab()}
          setRefetch={refetch => this.refetchCustomers = refetch}
          selected={this.selected}
          processData={data => data.map(d => ({
            ...d,
            banned: (
              <Switch
                checked={d.banned}
                onChange={async () => {
                  await this.onSwitchCompleted(d.id, d.banned = !d.banned)
                }}
                value="checked"
                color="primary"
              />
            )
          }))}
        />
      </div>
    )
  }

  refetchCustomers = () => {}
  refetchDoctors = () => {}

  renderDoctorTable() {
    return (
      <div className={styles.table} style={{display: this.tab === 1 ? 'block' : 'none'}} >
        <Table 
          rows={ROWS} 
          order={this.order}
          orderBy={this.orderBy}
          onRequestSort={this.onRequestSort}
          rowsPerPage={ROWS_PER_PAGE}
          onRowClick={async id => {
            this.isNew = false
            this.isEditModalActive = true
            await this.getUserById(id)
          }}
          onDelete={selected => {
            if (this.selected.length === 0) return
            this.isDeleteDialogActive = true
          }}
          path="/api/doctors"
          filterName="name"
          title="Membership"
          middleComponent={this.renderTab()}
          setRefetch={refetch => this.refetchDoctors = refetch}
          selected={this.selected}
          processData={data => data.map(d => ({
            ...d,
            banned: (
              <Switch
                checked={d.banned}
                onChange={async () => {
                  await this.onSwitchCompleted(d.id, d.banned = !d.banned)
                }}
                value="checked"
                color="primary"
              />
            )
          }))}
        />
      </div>
    )
  }

  onSwitchCompleted = async (id, banned) => {
    try {
      let { data } = await axios.patch(
        `/api/users/${id}`, 
        { banned }
      )

      console.log(data)
      await this.refetchDoctors()
      await this.refetchCustomers()
    } catch (err) {
      snackbar.show('There is an error occured.')
      console.log('ERROR WHILE ADDING NEW USER', err)
    }
  }

  renderTab() {
    return(
      <div className={styles.tab}>
        <Tabs
          value={this.tab}
          onChange={(e, v) => this.tab = v}
          indicatorColor="primary"
          textColor="primary"
          centered
          variant="fullWidth"
        >
          <Tab label="Customer" />
          <Tab label="Doctor" />
        </Tabs>
      </div>
    )
  }

  handleChange(name, value) {
    this[name] = value
  }

  renderEditUser() {
    if (this.isFetchingUser) return <CircularProgress className={styles.loading} />

    return (
      <form className={styles.edit} >
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.handleChange('name', e.target.value)}
          value={this.name}
          type="text"
        />
        <TextField
          label="Email"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.handleChange('email', e.target.value)}
          value={this.email}
          type="email"
        />
        <TextField
          className={styles.password}
          variant="outlined"
          type={this.shouldShowPassword ? 'text' : 'password'}
          label="Password"
          value={this.password}
          onChange={e => this.handleChange('password', e.target.value)}
          margin="dense"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={() => this.shouldShowPassword = !this.shouldShowPassword}
                >
                  {this.shouldShowPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Role"
          value={this.role}
          onChange={e => this.handleChange('role', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </TextField>
        {
          this.role !== 'admin'
            ? (
              <React.Fragment>
              <TextField
                select
                label="Gender"
                value={this.gender}
                onChange={e => this.handleChange('gender', e.target.value)}
                margin="normal"
                variant="outlined"
                fullWidth
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
              <TextField
                label="Age"
                fullWidth
                margin="dense"
                variant="outlined"
                onChange={e => this.handleChange('age', e.target.value)}
                value={this.age}
                type="text"
              />
              <TextField
                label="Phone"
                fullWidth
                margin="dense"
                variant="outlined"
                onChange={e => this.handleChange('phone', e.target.value)}
                value={this.phone}
                type="phone"
              />
              </React.Fragment>
            )
            : ''
        }
      </form>
    )
  }

  reset() {
    this.name = ''
    this.email = ''
    this.password = ''
    this.role = 'admin'
    this.gender = ''
    this.age = ''
    this.phone = ''
    this.shouldShowPassword = false
    this.search = ''
    this.filter = 'all'
    this.customer = null
  }

  onSearchChange = search => {
    this.search = search
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      //fetch
      // console.log('fetch with search query', search)
    }, 1000)
  }

  onSave = async () => {
    overlayLoading.show()
    let {
      name,
      email,
      password,
      role,
      age,
      gender,
      phone,
      isNew,
      id,
    } = this

    try {

      let body = {
        name,
        email,
        role,
      }

      if (role === 'customer') {
        body.customer = {
          age,
          gender,
          phone,
        }
      }

      if (role === 'doctor') {
        body.doctor = {
          age,
          gender,
          phone,
        }
      }

      if (password.length > 0) body.password = password
      let { data } = await axios[
          isNew 
            ? 'post' 
            : 'patch'
        ](
          `/api/users${!isNew ? `/${id}` : ''}`, 
          body
        )

      // console.log(data)
      snackbar.show(`New user was ${isNew ? 'created' : 'updated'}`)
      await this.refetchCustomers()
      await this.refetchDoctors()
    } catch (err) {
      snackbar.show('There is an error occured. Adding a new user was failed')
      console.log('ERROR WHILE ADDING NEW USER', err)
    }
    overlayLoading.hide()
    this.isEditModalActive = false
  }

  onDelete = async () => {
    console.log('To be deleted: ', this.selected.slice())
    try {
      overlayLoading.show()
      let toBeDeleted = this.selected.slice()
      for (let id of toBeDeleted) await axios.delete(`/api/users/${id}`)
      this.selected = []
      snackbar.show(`${toBeDeleted.length} news deleted`)
      await this.refetchCustomers()
      await this.refetchDoctors()
    } catch (err) {
      snackbar.show('There\'s an error occured')
      console.log('ERROR WHILE DELETING NEWS', err)
    }

    overlayLoading.hide()
    this.isDeleteDialogActive = false
  }

  render() {
    if (!user.isLoggedIn) return <CircularProgress className={styles.loading} />

    return (
      <div className={styles.container} >
        {
          user.isFetchingUsers
            ? <CircularProgress className={styles.loading} />
            : this.renderContent()
        }
        <Dialog
          open={this.isEditModalActive}
          onClose={() => this.isEditModalActive = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle 
            id="alert-dialog-title">
            {this.isNew ? 'Create New' : 'Edit'} User
          </DialogTitle>
          <DialogContent>
            {this.renderEditUser()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isEditModalActive = false} color="secondary">
              Close
            </Button>
            <Button onClick={this.onSave} color="primary" autoFocus>
              Save
            </Button>
          </DialogActions>
        </Dialog>

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
            Are you sure you want to delete {this.selected.length} users?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isDeleteDialogActive = false} color="primary">
              Cancel
            </Button>
            <Button onClick={this.onDelete} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default Membership