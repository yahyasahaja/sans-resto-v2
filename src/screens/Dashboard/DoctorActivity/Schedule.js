import React, { Component } from 'react'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import MenuItem from '@material-ui/core/MenuItem'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'

import styles from './css/schedule.module.scss'

import Table from '../../../components/Table'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import axios from 'axios'

import Navigation from '../../../components/Navigation'
import { doctor, overlayLoading, floatingButton } from '../../../services/stores'
// import { snackbar } from '../../../services/stores'

const ROWS = [
  { 
    id: 'hour_of_day', 
    numeric: false, 
    disablePadding: false, 
    label: 'Hour' 
  },
  { 
    id: 'max_reservation', 
    numeric: false, 
    disablePadding: false, 
    label: 'Max Reservation' 
  },
  { 
    id: 'subcategory_name', 
    numeric: false, 
    disablePadding: false, 
    label: 'Category' 
  },
  { 
    id: 'active', 
    numeric: false, 
    disablePadding: false, 
    label: 'Active', 
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

const HOUR = []
for (let i = 0; i < 24; i++) HOUR.push(i)

@observer
class Schedule extends Component {
  @observable schedule = []
  @observable selected = []
  @observable isLoading = false
  @observable isEditModalActive = false
  @observable isDeleteDialogActive = false
  @observable order = 'asc'
  @observable orderBy = ''
  @observable page = 0
  @observable isNew = false
  @observable scheduleId = -1
  @observable hour = 0
  @observable maxReservation = 1
  @observable subCategories = []
  @observable isFetchingSubCategories = false
  @observable subCategoryId = -1
  @observable nav = [
    {
      name: 'Doctors',
      url: '/dashboard/doctors'
    }
  ]

  componentWillUnmount() {
    floatingButton.hide()
  }

  async componentDidMount() {
    floatingButton.onClick = () => {
      this.reset()
      this.isNew = true
      this.isEditModalActive = true
    }
    floatingButton.show()

    this.fetchSubCategories()
    this.fetchSchedule()

    let id = this.props.match.params.doctor_id

    if (doctor.doctor) {
      this.nav.push({
        name: doctor.doctor.name,
        url: `/dashboard/doctors/${doctor.doctor.id}`,
      })
    } else {
      this.nav.push({
        name: (await doctor.fetchDoctor(id)).name,
        url: `/dashboard/doctors/${doctor.doctor.id}`,
      })
    }

    this.nav.push({
      name: this.props.match.params.day,
    })
  }

  async fetchSubCategories() {
    try {
      this.isFetchingSubCategories = true
      let {
        data: {
          data
        }
      } = await axios.get('/api/categories')

      let res = []
      for (let category of data) 
        if (category.sub_categories) 
          res = [...res, ...category.sub_categories]

      console.log(res)
      this.subCategories = res
      this.isFetchingSubCategories = false
      return data
    } catch (err) {
      this.isFetchingSubCategories = false
      console.log('ERROR WHILE FETCHING SUB CATEGORIES', err)
    }
  }

  async fetchSchedule(withoutLoading = false) {
    let id = this.props.match.params.doctor_id
    try {
      if (!withoutLoading) this.isLoading = true
      let { data: {data } } = await axios.get(`/api/doctors/${id}/schedules`)

      this.schedule = data.filter(d => {
        // console.log(d.day_of_week, DAY[this.props.match.params.day])
        return d.day_of_week === DAY[this.props.match.params.day]
      }).map(d => ({
        ...d, 
        subcategory_name: d.subcategory.name,
        active: (
        <Switch
          checked={d.is_active}
          onChange={async () => {
            let { doctor_id } = this.props.match.params
            await doctor.switchActive(doctor_id, d.id, d.is_active = !d.is_active)
            this.fetchSchedule(true)
          }}
          value="checked"
          color="primary"
        />
      )}))
      this.hour = this.schedule[0].hour_of_day
      console.log(this.hour)

      if (!withoutLoading) this.isLoading = false
    } catch (err) {
      if (!withoutLoading) this.isLoading = false
      console.log('ERROR WHILE FETCHING SCHEDULE', err)
    }
  }

  handleChange(name, value) {
    this[name] = value
  }

  renderEdit() {
    if (this.isFetchingSubCategories) return <CircularProgress className={styles.loading} />

    return (
      <div className={styles.edit} >
        <TextField
          label="Max Reservation"
          value={this.maxReservation}
          onChange={e => this.handleChange('maxReservation', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
          helperText={`Edit max reservation for ${this.hour}:00`}
        />
        <TextField
          select
          label="Category"
          value={this.subCategoryId}
          onChange={e => this.handleChange('subCategoryId', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
        >
          {
            this.subCategories.map((d, i) => (
              <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
            ))
          }
        </TextField>
      </div>
    )
  }

  renderNew() {
    if (this.isFetchingSubCategories) return <CircularProgress className={styles.loading} />
    
    let hourOfDays = this.schedule.map(d => d.hour_of_day)
    let res = HOUR.slice().filter(d => hourOfDays.indexOf(d) === -1)

    return (
      <div className={styles.new} >
        <TextField
          select
          label="Hour"
          value={this.hour}
          onChange={e => this.handleChange('hour', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
        >
          {res.map((data, i) => {
            return (
              <MenuItem 
                key={i}
                value={data}
              >
                {data}:00
              </MenuItem>
            )
          })}
        </TextField>
        <TextField
          label="Max Reservation"
          value={this.maxReservation}
          onChange={e => this.handleChange('maxReservation', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
        />
        <TextField
          select
          label="Category"
          value={this.subCategoryId}
          onChange={e => this.handleChange('subCategoryId', e.target.value)}
          margin="normal"
          variant="outlined"
          fullWidth
        >
          {
            this.subCategories.map((d, i) => (
              <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
            ))
          }
        </TextField>
      </div>
    )
  }

  reset() {
    if (this.schedule.length > 0) 
      this.hour = this.schedule[0].hour_of_day
    else 
      this.hour = 0
    this.maxReservation = 1
  }

  onSave = async () => {
    overlayLoading.show()
    let { doctor_id, day } = this.props.match.params
    if (this.isNew) {
      await doctor.addSchedule(doctor_id, {
        day_of_week: DAY[day],
        hour_of_day: this.hour,
        max_reservation: this.maxReservation,
        subcategory_id: this.subCategoryId
      })
    } else {
      await doctor.updateSchedule(doctor_id, this.scheduleId, {
        day_of_week: DAY[this.props.match.params.day],
        hour_of_day: this.hour,
        max_reservation: this.maxReservation,
        subcategory_id: this.subCategoryId
      })
    }
    overlayLoading.hide()
    this.isEditModalActive = false
    this.fetchSchedule()
  }

  onDelete = async () => {
    let selected = this.selected.slice()
    overlayLoading.show()
    for (let i of selected) {
      await doctor.deleteSchedule(this.props.match.params.doctor_id, i)
    }
    overlayLoading.hide()
    this.isDeleteDialogActive = false
    this.fetchSchedule()
  }

  renderTable() {
    if (this.isLoading) return <CircularProgress className={styles.loading} />

    if (this.schedule.length === 0) return <div className={styles['no-schedule']} >No schedule</div>
    
    return (
      <Table 
        rows={ROWS} 
        data={this.schedule.slice()} 
        // data={
        //   [
        //     {
        //       id: 1,
        //       name: 'yahya',
        //       email: 'yahya@yahya.com',
        //       role: 'admin'
        //     },
        //     {
        //       id: 2,
        //       name: 'yahya',
        //       email: 'yahya@yahya.com',
        //       role: 'admin'
        //     },
        //   ]
        // }
        order={this.order}
        orderBy={this.orderBy}
        page={this.page}
        title="Schedule"
        rowsPerPage={5}
        noPagination={true}
        onRowClick={async (id, n) => {
          this.isNew = false
          this.scheduleId = n.id
          this.hour = n.hour_of_day
          this.maxReservation = n.max_reservation
          this.subCategoryId = n.subcategory_id
          this.isEditModalActive = true
        }}
        onDelete={selected => {
          this.selected = selected
          this.isDeleteDialogActive = true
        }}
      />
    )
  }

  render() {
    return (
      <div className={styles.container} >
        <Navigation data={this.nav.slice()} />
        {this.renderTable()}
        
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
            {this.isNew ? 'Create New' : 'Edit'} Schedule
          </DialogTitle>
          <DialogContent>
            {this.isNew ? this.renderNew() : this.renderEdit()}
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
            <Button onClick={this.onDelete} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default Schedule