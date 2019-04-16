import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
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
import SelectableList from '../../../components/SelectableList'
// import InputAdornment from '@material-ui/core/InputAdornment'
// import SearchIcon from '@material-ui/icons/Search'
// import IconButton from '@material-ui/core/IconButton'

import styles from './css/index-reservation.module.scss'
import { user, snackbar, overlayLoading, floatingButton } from '../../../services/stores'
import categories from '../../../services/stores/categories';

const ROWS = [
  { id: 'customer_name', numeric: false, disablePadding: false, label: 'Customer Name' },
  { id: 'doctor_name', numeric: false, disablePadding: false, label: 'Doctor Name' },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
  { 
    id: 'complete_status', 
    numeric: false, 
    disablePadding: false, 
    label: 'Complete',
    disablePropagation: true 
  },
]

const DAY = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

const DAY_CODE = [
  null,
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const ROWS_PER_PAGE = 10

@observer
class Reservation extends Component {
  @observable reservations = []
  @observable page = 0
  @observable order = 'asc'
  @observable orderBy = ''
  //dialog edit
  @observable isEditModalActive = false
  @observable title = ''
  @observable id = -1
  @observable isFetchingReservation = false
  @observable isFetchingDoctorSchedule = false
  @observable isFetchingReservations = false
  @observable search = ''
  @observable filter = 'all'
  @observable isNew = false
  @observable shouldShowPassword = false
  @observable selected = []
  @observable isDeleteDialogActive = false
  @observable category = -1
  @observable subcategory = -1
  @observable subcategories = []
  @observable doctors = []
  @observable schedules = []
  @observable doctorIndex = -1
  @observable isFetchingDoctors = false
  @observable scheduleIndex = -1
  @observable customers = []
  @observable isFetchingCustomers = false
  @observable customerIndex = - 1
  @observable reservationId = -1

  async componentDidMount() {
    floatingButton.onClick = () => {
      this.reset()
      this.isNew = true
      this.isEditModalActive = true
    }
    floatingButton.show()

    // if (user.isLoggedIn) this.fetchReservations()
    // this.userDisposer = observe(user, 'data', () => {
    //   // console.log('berubah?')
    //   if (user.isLoggedIn) this.fetchReservations()
    // })

    // this.fetchCustomers()
    if (categories.categories.length === 0) await categories.fetchCategories()
    // let res = toJS(categories.categories)
    // let subcategories = []
    // for (let category of res)
    //   if (category.sub_categories) subcategories = [ ...subcategories, ...category.sub_categories]
    // this.subcategories = subcategories
    // console.log('subcategories', subcategories, res)
  }

  componentWillUnmount() {
    if (this.userDisposer) this.userDisposer()
    floatingButton.hide()
  }

  @computed
  get doctor() {
    if (this.doctorIndex === -1) return null
    return this.doctors[this.doctorIndex]
  }

  @computed 
  get schedule() {
    if (this.scheduleIndex === -1) return null
    return this.schedules[this.scheduleIndex]
  }

  @computed
  get customer() {
    return this.customers[0]
  }

  async fetchCustomers() {
    try {
      this.isFetchingCustomers = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/customers')

      this.customers = data
      this.isFetchingCustomers = false
    } catch (err) {
      this.isFetchingCustomers = false
      console.log('ERROR WHILE FETCHING CUSTOMERS', err)
    }
  }

  async fetchReservations() {
    try {
      this.isFetchingReservations = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/reservations')

      // // let reservations = 

      // console.log(reservations)
      // this.reservations = reservations

      this.isFetchingReservations = false
      return this.reservations
    } catch (err) {
      this.isFetchingReservations = false
      console.log('ERROR WHILE FETCHING RESERVATIONS', err)
    }
  }

  async fetchDoctors() {
    try {
      this.isFetchingDoctors = true
      let {
        data: {
          data
        }
      } = await axios.get(`/api/doctors/?subcategory_id=${this.subcategory}`)

      this.doctors = data
      this.isFetchingDoctors = false
    } catch (err) {
      this.isFetchingDoctors = false
      console.log('ERROR WHILE FETCHING DOCTORS WITH SUB CATEGORY', err)
    }
  }

  async fetchDoctorSchedule() {
    try {
      this.isFetchingDoctorSchedule = true

      let {
        data: {
          data
        }
      } = await axios.get(`/api/doctors/${this.doctor.id}/schedules`)

      // console.log(data)
      this.schedules = data
      this.isFetchingDoctorSchedule = false
    } catch (err) {
      this.isFetchingDoctorSchedule = false
      console.log('ERROR WHILE FETCHING DOCTOR RESERVATION', err)
    }
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
        <Table 
          rows={ROWS} 
          order={this.order}
          orderBy={this.orderBy}
          title="Reservation"
          onRequestSort={this.onRequestSort}
          rowsPerPage={ROWS_PER_PAGE}
          onRowClick={async (id, reservation) => {
            this.isNew = false
            this.reset()
            this.isEditModalActive = true
            this.customers = [reservation.customer]
            this.category = reservation.schedule.subcategory.category_id
            this.subcategories = categories.getSubCategories(this.category) || []
            this.subcategory = reservation.schedule.subcategory.id
            await this.fetchDoctors()
            this.doctorIndex = this.getIndex(this.doctors, reservation.schedule.doctor.id)
            await this.fetchDoctorSchedule()
            this.scheduleIndex = this.getIndex(this.schedules, reservation.schedule.id)
            // console.log('edit modal actived for', id)
            //fetch detail of n.id
            this.reservationId = id
            console.log(this.doctor, this.customer)
          }}
          onDelete={() => {
            if (this.selected.length === 0) return
            this.isDeleteDialogActive = true
          }}
          path="/api/reservations"
          filters={[
            {id: 'customer_name', label: 'Customer Name'},
            {id: 'doctor_name', label: 'Doctor Name'},
          ]}
          setRefetch={refetch => this.refetch = refetch}
          selected={this.selected}
          processData={data => data.map(d => ({
            ...d,
            customer_name: d.customer.name,
            doctor_name: d.schedule.doctor.name,
            complete_status: (
              <Switch
                checked={d.completed}
                onChange={async () => {
                  await this.onSwitchCompleted(d.id, d.completed = !d.completed)
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

  refetch = () => {}

  getIndex(arr, id) {
    for (let i in arr) if (arr[i].id === id) return i
  }

  handleChange(name, value) {
    this[name] = value
  }

  renderNewReservation() {
    if (this.isFetchingReservations) return <CircularProgress className={styles.loading} />
    // console.log('schedules', this.schedules)
    return (
      <form className={styles.edit} >
        <SelectableList 
          path="/api/customers"
          filterName="name"
          selecteds={this.customers}
          name="customer"
          singleSelection
        />
        {
          categories.categories.length > 0 && (
            <TextField
              select
              label="Category"
              value={this.category}
              onChange={e => {
                let id = e.target.value
                this.subcategory = -1
                this.handleChange('category', id)
                this.subcategories = categories.getSubCategories(id) || []
              }}
              margin="normal"
              variant="outlined"
              fullWidth
            >
              {categories.categories.map((d, i) => (
                <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
          )
        }
        {
          this.category != -1 && (
            <TextField
              select
              label="Sub Category"
              value={this.subcategory}
              onChange={e => {
                this.doctorIndex = -1
                this.handleChange('subcategory', e.target.value)
                this.fetchDoctors()
              }}
              margin="normal"
              variant="outlined"
              fullWidth
            >
              {this.subcategories.map((d, i) => (
                <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
          )
        }
        {
          this.doctors.length > 0 && (
            <TextField
              select
              label="Doctor"
              value={this.doctorIndex}
              onChange={e => {
                // this.handleChange('doctor', e.target.value)
                this.scheduleIndex = -1
                this.doctorIndex = e.target.value
                this.fetchDoctorSchedule()
              }}
              margin="normal"
              variant="outlined"
              fullWidth
            >
              {this.doctors.map((d, i) => (
                <MenuItem key={i} value={i}>{d.name}</MenuItem>
              ))}
            </TextField>
          )
        }
        {
          this.schedules.length > 0 && (
            <TextField
              select
              label="Schedule"
              value={this.scheduleIndex}
              onChange={e => {
                this.scheduleIndex = e.target.value
                // this.fetchDoctorSchedule()
              }}
              margin="normal"
              variant="outlined"
              fullWidth
            >
              {this.schedules.map((d, i) => (
                <MenuItem key={i} value={i}>
                  {DAY_CODE[d.day_of_week]} {d.hour_of_day}:00
                </MenuItem>
              ))}
            </TextField>
          )
        }

        {
          (
            this.isFetchingDoctors || 
            categories.isLoading || 
            this.isFetchingDoctorSchedule || 
            this.isFetchingCustomers
          ) && (
            <CircularProgress className={styles.loading} />
          )
        }
      </form>
    )
  }

  reset() {
    this.search = ''
    this.filter = 'all'
    this.doctors = []
    this.schedules = []
    this.subcategories = []
    this.doctorIndex = -1
    this.customers = []
    this.scheduleIndex = -1
    this.category = -1
    this.subcategory = -1
  }

  onSearchChange = search => {
    this.search = search
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      //fetch
      // console.log('fetch with search query', search)
    }, 1000)
  }

  onSwitchCompleted = async (id, completed) => {
    try {
      let { data } = await axios.patch(
        `/api/reservations/${id}`, 
        { completed }
      )

      console.log(data)
      await this.refetch()
    } catch (err) {
      snackbar.show('There is an error occured.')
      console.log('ERROR WHILE ADDING NEW USER', err)
    }
  }

  onSave = async () => {
    overlayLoading.show()

    let { reservationId, isNew } = this
    
    try {

      let body = {
        schedule_id: this.schedule.id,
        customer_id: this.customer.id
      }

      let { data } = await axios[
        isNew 
          ? 'post' 
          : 'patch'
      ](
        `/api/reservations${!isNew ? `/${reservationId}` : ''}`, 
        body
      )

      console.log(data)
      snackbar.show('Schedule Reserved')
      await this.refetch()
    } catch (err) {
      snackbar.show('There is an error occured.')
      console.log('ERROR WHILE ADDING NEW USER', err)
    }
    overlayLoading.hide()
    this.isEditModalActive = false
  }

  onDelete = async () => {
    try {
      overlayLoading.show()
      let toBeDeleted = this.selected.slice()
      console.log(toBeDeleted)
      for (let id of toBeDeleted) await axios.delete(`/api/reservations/${id}`)
      snackbar.show(`${toBeDeleted.length} reservations deleted`)
      this.selected = []
      await this.refetch()
    } catch (err) {
      snackbar.show('There\'s an error occured')
      console.log('ERROR WHILE DELETING NEWS', err)
    }

    overlayLoading.hide()
    this.isDeleteDialogActive = false
  }

  render() {
    if (this.isFetchingReservations || user.isLoading) 
      return <CircularProgress className={styles.loading} />

    return (
      <div className={styles.container} >
        {
          this.isFetchingReservations
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
            {this.isNew ? 'Create New' : 'Edit'} Reservation
          </DialogTitle>
          <DialogContent>
            {this.renderNewReservation()}
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

export default Reservation