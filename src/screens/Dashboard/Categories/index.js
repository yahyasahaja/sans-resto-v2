import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import axios from 'axios'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Delete from '@material-ui/icons/Delete'
import Edit from '@material-ui/icons/Edit'
import IconButton from '@material-ui/core/IconButton'
import Add from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'

import styles from './css/categories.module.scss'
import { snackbar, overlayLoading } from '../../../services/stores'
import categories from '../../../services/stores/categories'
import PhotoUploader from '../../../components/PhotoUploader'

@observer
class Category extends Component {
  @observable categories = []
  @observable isLoading = false
  @observable category = {name: '', icon: ''}
  @observable name = ''
  @observable isEditSubCategoryDialogOpened = false
  @observable isEditCategoryDialogOpened = false
  @observable isDeleteCategoryDialogOpened = false
  @observable isDeleteSubCategoryDialogOpened = false
  @observable isNewCategoryDialogOpened = false
  @observable isNewSubCategoryDialogOpened = false
  @observable categoryId = -1
  @observable subCategoryId = -1
  @observable subCategory = {name: '', description: '', photo: ''}
  @observable categoryIcon = ''
  @observable categoryIconFile = null
  @observable subCategoryIcon = ''
  @observable subCategoryIconFile = null

  componentDidMount() {
    if (categories.categories.length === 0) this.fetchCategories()
  }

  reset() {
    this.categoryIcon = ''
    this.categoryIconFile = null
    this.subCategoryIcon = ''
    this.subCategoryIconFile = null
    this.category = {name: '', icon: ''}
    this.subCategory = {name: '', description: '', photo: ''}
    this.name = ''
  }

  async fetchCategories(withoutLoading) {
    await categories.fetchCategories(withoutLoading)
  }

  upload = async file => {
    let formData = new FormData()
    formData.append('photo', file)
    let photo = ''

    try {
      let {
        data: {
          data
        }
      } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      photo = data
    } catch (err) {
      console.log('ERROR WHILE UPLAODING FILE', err)
    }

    return photo
  }

  onNewCategory = async e => {
    e.preventDefault()
    let { name, icon } = this.category
    let { name: name2, photo, description } = this.subCategory

    overlayLoading.show()
    if (this.categoryIconFile) icon = await this.upload(this.categoryIconFile)
    if (this.subCategoryIconFile) photo = await this.upload(this.subCategoryIconFile)
    let res = await categories.addCategory({name, icon})
    let res2 = await categories.addSubCategory({name: name2, photo, description}, res.id)

    this.isNewCategoryDialogOpened = false
    if (res && res2) snackbar.show(`Category ${this.category.name} added`)
  }

  onEditCategory = async () => {
    let { name, icon } = this.category
    if (this.categoryIconFile) icon = await this.upload(this.categoryIconFile)
    let res = await categories.updateCategory(this.categoryId, {name, icon})

    this.isNewCategoryDialogOpened = false
    if (res) snackbar.show(`Category ${this.category.name} added`)
  }

  onDeleteCategory = async () => {
    let res = await categories.deleteCategory(this.category.id)
    this.isDeleteCategoryDialogOpened = false
    if (res) snackbar.show(`Category ${this.category.name} deleted`)
  }

  onNewSubCategory = async () => {
    let res = await categories.addSubCategory({name: this.subCategory.name}, this.categoryId)
    this.isEditDialogOpened = false
    if (res) snackbar.show(`Sub category ${this.subCategory.name} added`)
  }

  onEditSubCategory = async () => {
    let { name, description, photo } = this.subCategory
    if (this.subCategoryIconFile) photo = await this.upload(this.subCategoryIconFile)
    let res = await categories.updateSubCategory(
      this.subCategoryId, 
      { name, description, photo },
      this.categoryId
    )

    this.isNewCategoryDialogOpened = false
    if (res) snackbar.show(`Category ${this.category.name} added`)
  }

  onDeleteSubCategory = async () => {
    let res = await categories.deleteSubCategory(this.subCategory.id, this.categoryId)
    this.isDeleteSubCategoryDialogOpened = false
    if (res) snackbar.show(`Category ${this.category.name} deleted`)
  }
  
  renderList() {
    return categories.categories.map((c, i) => (
      <React.Fragment key={i} >
        <ListItem button onClick={() => {
          c.isOpened = !c.isOpened
        }}>
          {/* <ListItemIcon>
            <InboxIcon />
          </ListItemIcon> */}
          <ListItemText primary={c.name} />
          <IconButton
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              this.reset()
              this.category = toJS(c)
              this.categoryId = c.id
              this.categoryIcon = c.icon
              this.isEditCategoryDialogOpened = true
            }}
            className={styles['list-btn']} 
            aria-label="Delete">
            <Edit />
          </IconButton>
          <IconButton 
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              this.reset()
              this.category = toJS(c)
              this.categoryId = c.id
              this.isDeleteCategoryDialogOpened = true
            }}
            className={styles['list-btn']} 
            aria-label="Delete">
            <Delete />
          </IconButton>
          {this.isOpened ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse className={styles.sub} in={c.isOpened} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {c.sub_categories && c.sub_categories.map((sub, i) => (
              <ListItem 
                key={i} 
                button 
                className={styles.nested}
                onClick={e => { //edit
                  e.preventDefault()
                  e.stopPropagation()
                  this.reset()
                  this.subCategory = toJS(sub)
                  this.subCategoryId = sub.id
                  this.categoryId = c.id
                  this.subCategoryIcon = sub.photo
                  this.isEditSubCategoryDialogOpened = true
                }}
              >
                <ListItemIcon>
                  <ChevronRight />
                </ListItemIcon>
                <ListItemText inset primary={sub.name} />
                <IconButton
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    this.reset()
                    this.subCategory = toJS(sub)
                    this.subCategoryId = sub.id
                    this.categoryId = c.id
                    this.subCategoryIcon = sub.photo
                    this.isEditSubCategoryDialogOpened = true
                  }}
                  className={styles['list-btn']} 
                  aria-label="Delete">
                  <Edit />
                </IconButton>
                <IconButton 
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    this.reset()
                    this.subCategory = toJS(sub)
                    this.subCategoryId = sub.id
                    this.categoryId = c.id
                    this.isDeleteSubCategoryDialogOpened = true
                  }}
                  className={styles['list-btn']} 
                  aria-label="Delete">
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              className={styles.button}
              onClick={() => {
                this.reset()
                this.category = { name: '' }
                this.isNew = true
                this.categoryId = c.id
                this.isNewSubCategoryDialogOpened = true
              }}
            >
              <Add className={styles.rightIcon} />
              Add Sub Category
            </Button>
          </List>
        </Collapse>
      </React.Fragment>
    ))
  }

  renderNewSubCategory() {
    return (
      <React.Fragment>
        <TextField
          label="Sub Category"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.subCategory.name = e.target.value}
          value={this.subCategory.name}
          type="text"
          required
        />
        <TextField
          label="Sub Category Description"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.subCategory.description = e.target.value}
          value={this.subCategory.description}
          type="text"
        />
        <PhotoUploader 
          image={this.subCategoryIcon}
          onChange={file => {
            this.subCategoryIconFile = file
            this.subCategoryIcon = file ? URL.createObjectURL(file) : null
          }}
        />
      </React.Fragment>
    )
  }

  renderNewCategory() {
    return (
      <React.Fragment>
        <h1>Category</h1>
        <TextField
          label="Category"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.category.name = e.target.value}
          value={this.category.name}
          type="text"
          required
        />
        <PhotoUploader 
          image={this.categoryIcon}
          onChange={file => {
            this.categoryIconFile = file
            this.categoryIcon = file ? URL.createObjectURL(file) : null
          }}
        />
        <h1>Sub Category</h1>
        {this.renderNewSubCategory()}
      </React.Fragment>
    )
  }

  renderEditSubCategory() {
    return this.renderNewSubCategory()
  }

  renderEditCategory() {
    if (!this.category) return

    return (
      <React.Fragment>
        <TextField
          label="Category"
          fullWidth
          margin="dense"
          variant="outlined"
          onChange={e => this.category.name = e.target.value}
          value={this.category.name}
          type="text"
          required
        />
        <PhotoUploader 
          image={this.categoryIcon}
          onChange={file => {
            this.categoryIconFile = file
            this.categoryIcon = file ? URL.createObjectURL(file) : null
          }}
        />
      </React.Fragment>
    )
  }

  render() {
    if (categories.isLoading) return <CircularProgress className={styles.loading} />

    return (
      <div className={styles.container} >
        <List component="nav">
          {this.renderList()}
        </List>

        <Button 
          fullWidth 
          variant="contained" 
          color="primary" 
          className={styles.button}
          onClick={() => {
            this.reset()
            this.category = { name: '' }
            this.isNew = true
            this.categoryId = -1
            this.isNewCategoryDialogOpened = true
          }}
        >
          <Add className={styles.rightIcon} />
          Add Category
        </Button>
        
        <Dialog
          open={this.isNewCategoryDialogOpened}
          onClose={() => this.isNewCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          scroll="body"
          maxWidth="md"
        >
          <form onSubmit={this.onNewCategory}>
            <DialogTitle 
              id="alert-dialog-title">
              Add New Category
            </DialogTitle>
            <DialogContent>
              {this.renderNewCategory()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.isNewCategoryDialogOpened = false} color="secondary">
                Close
              </Button>
              <Button type="submit" color="primary" autoFocus>
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={this.isNewSubCategoryDialogOpened}
          onClose={() => this.isNewSubCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle 
            id="alert-dialog-title">
            Add New Sub Category
          </DialogTitle>
          <DialogContent>
            {this.renderNewSubCategory()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isNewSubCategoryDialogOpened = false} color="secondary">
              Close
            </Button>
            <Button onClick={this.onNewSubCategory} color="primary" autoFocus>
              Save
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
          open={this.isEditCategoryDialogOpened}
          onClose={() => this.isEditCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle 
            id="alert-dialog-title">
            Edit Category
          </DialogTitle>
          <DialogContent>
            {this.renderEditCategory()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isEditCategoryDialogOpened = false} color="secondary">
              Close
            </Button>
            <Button onClick={this.onEditCategory} color="primary" autoFocus>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.isEditSubCategoryDialogOpened}
          onClose={() => this.isEditSubCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle 
            id="alert-dialog-title">
            Edit Sub Category
          </DialogTitle>
          <DialogContent>
            {this.renderEditSubCategory()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isEditSubCategoryDialogOpened = false} color="secondary">
              Close
            </Button>
            <Button onClick={this.onEditSubCategory} color="primary" autoFocus>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.isDeleteCategoryDialogOpened}
          onClose={() => this.isDeleteCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Delete Category
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete category {this.category && this.category.name}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isDeleteCategoryDialogOpened = false} color="primary">
              Cancel
            </Button>
            <Button onClick={this.onDeleteCategory} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.isDeleteSubCategoryDialogOpened}
          onClose={() => this.isDeleteSubCategoryDialogOpened = false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Delete Sub Category
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete sub category {this.subCategory && this.subCategory.name}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.isDeleteSubCategoryDialogOpened = false} color="primary">
              Cancel
            </Button>
            <Button onClick={this.onDeleteSubCategory} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default Category