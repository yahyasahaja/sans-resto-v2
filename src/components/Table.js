import React from 'react'
// import classNames from 'classnames'
// import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
// import FilterListIcon from '@material-ui/icons/FilterList'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import classes from './css/table.module.scss'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import Loading from './Loading'

class EnhancedTableHead extends React.Component {
  createSortHandler = property => () => {
    if (this.props.onRequestSort) this.props.onRequestSort(property)
  }

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, rows } = this.props

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    )
  }
}

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
})

let EnhancedTableToolbar = props => {
  const { title, onDelete, selected } = props
  const numSelected = selected.length

  // if (!title) return <div />

  return (
    <Toolbar
      className={`${classes.toolbar} ${numSelected > 0 && classes.selected}`}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            <span className={classes.numselected} >{numSelected} selected</span>
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            {title}
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <Tooltip title="Delete">
          <IconButton 
            onClick={() => onDelete && onDelete(selected.slice())} 
            aria-label="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  )
}

// EnhancedTableToolbar.propTypes = {
//   classes: PropTypes.object.isRequired,
//   numSelected: PropTypes.number.isRequired,
// }

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar)

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
})

@observer
class EnhancedTable extends React.Component {
  @observable selected = []

  handleSelectAllClick = event => {
    let { data } = this.props
    let selected = this.selected

    if (this.props.selected) selected = this.props.selected
    if (event.target.checked) {
      for (let d of data) {
        if (selected.indexOf(d.id) === -1) selected.push(d.id)
      }
      return
    }

    for (let d of data) {
      let i = selected.indexOf(d.id)
      if (i !== -1) selected.splice(i, 1)
    }
  }

  onRowCheckboxClick = (event, id) => {
    let selected = this.selected

    if (this.props.selected) selected = this.props.selected

    let i = selected.indexOf(id)
    if (i === -1) selected.push(id)
    else selected.splice(i, 1)
  }

  handleChangePage = (event, page) => {
    this.page = page
  }

  isSelected = id => {
    let selected = this.selected
    if (this.props.selected) selected = this.props.selected

    return selected.indexOf(id) !== -1
  }

  componentDidMount() {
    window.abc = this
  }

  render() {
    let {
      selected
    } = this
    const { 
      data, order, orderBy, page, 
      rows, title, rowsPerPage,
      onDelete, isLoading, meta
    } = this.props
    // const emptyRows = rowsPerPage - Math.min(
    //   rowsPerPage, data.length - page * rowsPerPage
    // )

    let total = data.length
    if (meta && meta.total) total = meta.total

    if (this.props.selected) selected = this.props.selected

    return (
      <div className={classes.container}>
        <EnhancedTableToolbar 
          onDelete={onDelete} 
          selected={selected} 
          title={title} 
        />
        {this.props.middleComponent}
        <div className={classes['table-wrapper']}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.props.onRequestSort}
              rowCount={data.length}
              {...this.props}
            />
            <TableBody>
              {
                data.map(n => {
                  const isSelected = this.isSelected(n.id)
                  return (
                    <TableRow
                      hover
                      onClick={() => this.props.onRowClick(n.id, n, this.props.data)}
                      style={{cursor: 'pointer'}}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                    >
                      <TableCell 
                        padding="checkbox" 
                        style={{width: 20}}
                        onClick={e => {
                          e.stopPropagation()
                          this.onRowCheckboxClick(e, n.id)
                        }}>
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      {
                        rows.map((row, i) => {
                          return (
                            <TableCell onClick={e => {
                              if (row.disablePropagation) {
                                e.stopPropagation()
                              }
                            }} key={i}>
                              {n[row.id]}
                            </TableCell>
                          )
                        })}
                    </TableRow>
                  )
                })}
              {/* {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )} */}
            </TableBody>
          </Table>
          {isLoading && <Loading />}
        </div>
        {
          !this.props.noPagination && (
            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              backIconButtonProps={{
                'aria-label': 'Previous Page',
              }}
              nextIconButtonProps={{
                'aria-label': 'Next Page',
              }}
              onChangePage={(e, page) => this.props.onPageChange(page + 1)}
            />
          )
        }
      </div>
    )
  }
}

// EnhancedTable.propTypes = {
//   classes: PropTypes.object.isRequired,
// }

export default withStyles(styles)(EnhancedTable)