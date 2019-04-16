// import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import axios from 'axios'

class Doctor {
  @observable isFetchingDoctor = false
  @observable isFetchingDoctors = false
  @observable isFetchingSchedule = false
  @observable isAddingSchedule = false
  @observable isDeletingSchedule = false
  @observable schedule = []
  @observable doctor = null
  @observable doctors = []
  @observable nav = [
    {
      name: 'Doctors',
      url: '/dashboard/doctors'
    }
  ]
  
  @action
  async fetchDoctors() {
    try {
      this.isFetchingDoctors = true
      let { data: { data } } = await axios.get('/api/doctors')
      // console.log(data)
      this.doctors = data
      this.isFetchingDoctors = false
    } catch (err) {
      this.isFetchingDoctors = false
      console.log('ERROR WHILE FETCHING DOCTORS', err)
    }
  }

  @action
  async fetchDoctor(id) {
    try {
      this.isFetchingDoctor = true
      let { data: { data } } = await axios.get(`/api/doctors/${id}`)
      this.isFetchingDoctor = false
      this.doctor = data
      // console.log('DOCTOR', data)
      return data
    } catch (err) {
      this.isFetchingDoctor = false
      console.log('Error fetching doctor with id', id)
    }
  }

  @action
  async fetchSchedule(id) {
    try {
      this.isFetchingSchedule = true
      let { data: {data } } = await axios.get(`/api/doctors/${id}/schedules`)

      this.schedule = data
      this.isFetchingSchedule = false
      return data
    } catch (err) {
      this.isFetchingSchedule = false
      console.log('ERROR WHILE FETCHING SCHEDULE', err)
    }
  }

  @action
  async addSchedule(id, data) {
    try {
      this.isAddingSchedule = true
      await axios.post(`/api/doctors/${id}/schedules`, data)
      this.isAddingSchedule = false
      return true
    } catch (err) {
      this.isAddingSchedule = false
      console.log('ERROR WHILE ADDING SCHEDULE', err)
    }
  }

  @action
  async deleteSchedule(doctorId, scheduleId) {
    try {
      this.isDeletingSchedule = true
      await axios.delete(`/api/doctors/${doctorId}/schedules/${scheduleId}`)
      this.isDeletingSchedule = false
      return true
    } catch (err) {
      this.isDeletingSchedule = false
      console.log('ERROR WHILE DELETING SCHEDULE', err)
    }
  }

  @action
  async updateSchedule(doctorId, scheduleId, data) {
    try {
      this.isUpdatingSchedule = true
      await axios.patch(`/api/doctors/${doctorId}/schedules/${scheduleId}`, data)
      this.isUpdatingSchedule = false
      return true
    } catch (err) {
      this.isUpdatingSchedule = false
      console.log('ERROR WHILE DELETING SCHEDULE', err)
    }
  }

  @action
  async switchActive(doctorId, scheduleId, is_active) {
    try {
      // this.isUpdatingSchedule = true
      await axios.patch(`/api/doctors/${doctorId}/schedules/${scheduleId}`, {
        is_active
      })
      // this.isUpdatingSchedule = false
      return true
    } catch (err) {
      // this.isUpdatingSchedule = false
      console.log('ERROR WHILE DELETING SCHEDULE', err)
    }
  }
}

export default new Doctor()