import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import axios from 'axios'
import { Line, Pie, Doughnut } from 'react-chartjs-2'
// import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import styles from './css/home.module.scss'

import ReportCard from '../../../components/ReportCard'

@observer
class Home extends Component {
  @observable data = {}
  @observable isLoading = false
  @observable total_customer_count = 0
  @observable incomplete_reservation_count = 0
  @observable completed_reservation_count = 0
  @observable last_7_days_reservation_count = []
  @observable last_registered_customers = []
  @observable top_reservation_customers = []
  @observable customer_count_by_gender = {}
  @observable top_subcategories = []

  componentDidMount() {
    this.fetchData() 
  }

  fetchData = async () => {
    try {
      let {
        data: {
          data
        }
      } = await axios.get('/api/reports')
      
      for (let i in data) this[i] = data[i]
    } catch (err) {
      console.log('ERROR WHILE UPLAODING FILE', err)
    } 
  }

  render() {
    if (this.isLoading) return <CircularProgress className={styles.loading} />

    let sevendaysData = {
      labels: this.last_7_days_reservation_count.map(d => {
        let date = new Date(d.date)
        return `${date.getDate()}/${date.getMonth()}`
      }),
      datasets: [
        {
          label: 'Last 7 days reservation',
          data: this.last_7_days_reservation_count.map(d => d.count),
          fill: false,          // Don't fill area under the line
          borderColor: 'green'  // Line color
        }
      ]
    }

    let customerGenderData = {
      labels: ['Male', 'Female'],
      datasets: [
        {
          label: 'Customer Count by Gender',
          data: [
            this.customer_count_by_gender.male, 
            this.customer_count_by_gender.female, 
          ],
          backgroundColor: ["#03a9f4", "#e91e63"],
        },
      ]
    }

    let reservationCategoriesData = {
      labels: this.top_subcategories.map(d => 
        d.subcategory_name
          .toLowerCase()
          .split(' ')
          .map(d => d[0].toUpperCase() + d.slice(1))
          .join(' ')
      ),
      datasets: [
        {
          label: 'Customer Count by Gender',
          data: this.top_subcategories.map(d => d.count),
          backgroundColor: ["#1abc9c", "#3498db", '#9b59b6', '#e67e22', '#e74c3c'],
        },
      ]
    }

    return (
      <div className={styles.container} >
        <div className={styles.top}>
          <ReportCard
            number={this.total_customer_count}
            title="Registrasi User"
            icon="account-arrow-left"
            primaryColor="#03A9F4"
          />
          <ReportCard
            number={this.completed_reservation_count}
            title="Reservasi Selesai"
            icon="clipboard-check"
            primaryColor="#009688"
          />
          <ReportCard
            number={this.incomplete_reservation_count}
            title="Reservasi Belum Selesai"
            icon="progress-check"
            primaryColor="#FF9800"
          />
        </div>

        <div className={styles.middle} >
          <div className={styles.sevendays} > 
            <div className={styles.title} >Last 7 Days Reservation</div>
            <div className={styles.chart} >
              <Line 
                data={sevendaysData} 
                options={{
                  scales: {
                    yAxes: [{
                      ticks: {
                        beginAtZero: true
                      }
                    }]
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.bottom} >
          <div className={styles['list-container']} >
            <div className={styles.title} >Top Customer Reservations</div>
            <List component="nav" className={styles.list}>
              {this.top_reservation_customers.map((d, i) => {
                return (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <span className={`mdi mdi-account ${styles.icon}`} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={d.name} 
                    />
                  </ListItem>
                )
              })}
            </List>
          </div>

          <div className={styles['list-container']} >
            <div className={styles.title} >Last Registered Customers</div>
            <List component="nav" className={styles.list}>
              {this.last_registered_customers.map((d, i) => {
                return (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <span className={`mdi mdi-account ${styles.icon}`} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={d.name} 
                    />
                  </ListItem>
                )
              })}
            </List>
          </div>
        </div>

        <div className={styles.pie} >
          <div className={styles.sevendays} > 
            <div className={styles.title} >Customer Count by Gender</div>
            <div className={styles.chart} >
              <Pie 
                data={customerGenderData} 
              />
            </div>
          </div>
          <div className={styles.sevendays} > 
            <div className={styles.title} >Top Reservations</div>
            <div className={styles.chart} >
              <Doughnut 
                data={reservationCategoriesData} 
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home