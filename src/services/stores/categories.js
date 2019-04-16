import axios from 'axios'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import overlayLoading from './overlayLoading'

class Categories {
  @observable categories = []
  @observable isFetchingCategories = false
  @observable isLoading = false

  async fetchCategories(withoutLoading) {
    try {
      if (!withoutLoading) this.isLoading = true
      let {
        data: {
          data: categories
        }
      } = await axios.get('/api/categories')
  
      this.categories = categories.map((d, i) => ({
        ...d, 
        isOpened: i < this.categories.length ? this.categories[i].isOpened : false
      }))
      if (!withoutLoading) this.isLoading = false
      return true
    } catch (err) {
      if (!withoutLoading) this.isLoading = false
      console.log('ERROR WHILE FETCHING CATEGORIES', err)
    }
  }

  async addCategory({name, icon}) {
    try {
      let body = { name }
      if (icon && icon.length > 0) body.icon = icon 
      overlayLoading.show()
      let {
        data: {
          data
        }
      } = await axios.post('/api/categories', body)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return data
    } catch (err) {
      overlayLoading.hide()
      console.log('ERROR WHILE ADDING CATEGORIES', err)
    }
  }

  async updateCategory(id, {name, icon}) {
    try {
      let body = { name }
      if (icon && icon.length > 0) body.photo = icon 
      overlayLoading.show()
      await axios.patch(`/api/categories/${id}`, body)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return true
    } catch (err) {
      overlayLoading.hide()
      console.log('ERROR WHILE ADDING CATEGORIES', err)
    }
  }

  async deleteCategory(id) {
    try {
      overlayLoading.show()
      await axios.delete('/api/categories/' + id)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return true
    } catch (err) {
      overlayLoading.hide()
      console.log('ERROR WHILE DELETING CATEGORIES', err)
    }
  }

  async addSubCategory({name, description, photo}, categoryId) {
    try {
      overlayLoading.show()
      let body = { name, description }
      if (photo && photo.length > 0) body.photo = photo 
      await axios.post(`/api/categories/${categoryId}/subcategories`, body)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return true
    } catch (err) {
      this.isLoading = false
      console.log('ERROR WHILE ADDING SUB CATEGORIES', err)
    }
  }

  async updateSubCategory(id, {name, description, photo}, categoryId) {
    try {
      let body = { name, description }
      if (photo && photo.length > 0) body.photo = photo 
      overlayLoading.show()
      await axios.patch(`/api/categories/${categoryId}/subcategories/${id}`, body)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return true
    } catch (err) {
      overlayLoading.hide()
      console.log('ERROR WHILE ADDING CATEGORIES', err)
    }
  }

  async deleteSubCategory(id, categoryId) {
    try {
      overlayLoading.show()
      await axios.delete(`/api/categories/${categoryId}/subcategories/${id}`)
      this.fetchCategories(true)
  
      overlayLoading.hide()
      return true
    } catch (err) {
      overlayLoading.hide()
      console.log('ERROR WHILE DELETING CATEGORIES', err)
    }
  }

  getSubCategories(categoryId) {
    let categories = this.categories.slice()
    for (let category of categories)
      if (category.id === categoryId) return category.sub_categories
  }
}

export default window.categories = new Categories()