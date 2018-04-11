'use strict'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table, Menu, Icon, Segment, Input, Popup } from 'semantic-ui-react'
import capitalize from 'lodash/capitalize'
import flatten from 'lodash/flatten'
import orderBy from 'lodash/orderBy'
import debounce from 'lodash/debounce'

const dataParser = (obj) => {
	if(!obj) return [{}]

	const nativeDefaults = {
		string: '',
		date: new Date(),
		number: 0,
		boolean: false,
	}

	const headerObject = (key, display, type, def) => ({ key, type, display, defaults: def })

	const supportedNativeTypes = [String, Date, Number, Boolean]

	const parsedHeaders = {}

	Object.keys(obj).forEach(key => {
		supportedNativeTypes.forEach(type => {
			if (obj[key] && obj[key].constructor === type) {
				const typeName = type.name.toLowerCase()
				parsedHeaders[key] = headerObject(key, capitalize(key), typeName, nativeDefaults[typeName])
			}
		})
	})
	return parsedHeaders
}

/*
* Semantic-UI DataTable
*
* --- Options ---
* columns: This is the table definition. The default behavior (if no columns option is defined) tries to parse the data, 
* figure out what type of fields are in it and format it to the correct "schema".
*
* Example Schema:[{
*	key: 'name', // the key of the object
*	type: 'string', // native type of the data
*	display: 'Name' // the column header 
*	defaults: 'N/A' // if a value is not found what should we show? Can be anything but needs to be a resolved value
*	accessor: (fullObject, key) => {} // optional: if theirs some special way to access the data or if it's nested use an accessor function
*	decorator: (value) => {} // optional: after a value has been retrieved (either by the default object[key] or with an accessor) it'll be passed to this function, i.e. formating time stamps with MomentJS 
* }, {...}, {...}]
* 
* renderHeaderRow: The function called to render the header row with the data provided by the columns schema. A default is provided but if you want to change the headers or nest them. 
* The function is passed 3 params, the columns array, the onClick handler for handling the sorting logic and the classNameGenerator for adding the ascending/descending header class.
* Note: It's possible to override the onClick handler but make sure to call it after your own logic if you want the default sorting to work.
* 
* renderBodyRow: This is the function your probably going to want to override. The default function thakes the column and renders the data. 
* First, if there is a accessor function it uses that to grab the data (use column schema definition above) if theres not then it's a simple (data[key] || defaults)
* Second, if there's a decorator, it... decorates...
* Lastly, it renders the Table.Cell with the value 
*
* pageLimit: How many results per page do you want to show? default is 15
*
*
* Overall this is a good starting point, needs some extra stuff, but it'll work for now.
*/
class DataTable extends Component {
	defaultPageLimit = 15
	defaultShowSearch = false;
	defaultMainHeader = "";
	defaultableScrollHeight = 0
	constructor(props) {
		super(props)
		this.data = props.data
		this.renderRow = props.renderBodyRow || this.defaultRenderBodyRow
		this.renderHeader = props.renderHeaderRow || this.defaultRenderHeaderRow
		this.columns = props.columns || dataParser((this.data || []).pop())
		this.paginationLimit = props.pageLimit || this.defaultPageLimit
		this.showSearch = props.showSearch || this.defaultShowSearch
		this.mainHeader = props.mainHeader || this.defaultMainHeader
		this.tableScrollHeight = props.tableScrollHeight || this.defaultableScrollHeight
		const data = this.paginate(this.data)
		
		this.orignalPagedData = data
		this.pagedData = data

		this.state = {
			index: 0,
			sort: {},
			data: data[0]
		}
	}

	componentWillReceiveProps(newProps) {
		this.data = newProps.data
		this.renderRow = newProps.renderBodyRow || this.defaultRenderBodyRow
		this.renderHeader = newProps.renderHeaderRow || this.defaultRenderHeaderRow
		this.columns = newProps.columns || dataParser((this.data || []).pop())
		this.paginationLimit = newProps.pageLimit || this.defaultPageLimit
		this.showSearch = newProps.showSearch || this.defaultShowSearch
		this.mainHeader = newProps.mainHeader || this.defaultMainHeader
		this.tableScrollHeight = newProps.tableScrollHeight || this.defaultableScrollHeight
		const data = this.paginate(this.data)
		
		this.orignalPagedData = data
		this.pagedData = data

		this.setState({
			index: 0,
			sort: {},
			data: data[this.state.index]
		})
	}

	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		renderBodyRow: PropTypes.func,
		renderHeaderRow: PropTypes.func,
		pageLimit: PropTypes.number,
		showSearch: PropTypes.bool,
		columns: PropTypes.arrayOf(PropTypes.shape({
			key: PropTypes.string,
			type: PropTypes.string,
			display: PropTypes.string,
			defaults: PropTypes.any,
			accessor: PropTypes.func,
			decorator: PropTypes.func,
			colSpan:PropTypes.number
		})),
	}

	defaultRenderHeaderRow = (columns, onClick, classNameGenerator) => {
		return (
			<Table.Row>
				{columns.map((column, index) => (
					column.display && 
					<Table.HeaderCell onClick={() => onClick(column)} className={classNameGenerator(column.key)} key={index} 
						colSpan={column.colSpan?column.colSpan:1}>
						{column.display}
					</Table.HeaderCell>
				))}
			</Table.Row>
		)
	}

	defaultRenderBodyRow = (data, index) => {
		let tableRow = <Table.Row key={index}>
			{this.columns.map(({ key, defaults, accessor, decorator }, idx) => {
				if(!data) return <Table.Cell key={idx} />
				let value = (accessor) ? accessor(data, key) : (data[key] || defaults)
				if(decorator) value = decorator(value)
				return (<Table.Cell key={idx}>{value}</Table.Cell>)
			})}
		</Table.Row>
		if(data['popupContent']) {
			tableRow = <Popup trigger={tableRow} key={index}>
				{data['popupContent']}
			</Popup>
		}
		return tableRow;
	}

	pageChange = index => {
		let newIndex = this.state.index

		if (index === newIndex) return null
		else if (index === 'next') newIndex++
		else if (index === 'back') newIndex--
		else newIndex = index

		this.setState({ data: this.pagedData[newIndex], index: newIndex })
	}

	sort = (sort, key, data) => {

		let newSort = false

		if(!sort[key]) {
			sort[key] = 'ascending'
			newSort = true
		}

		if (sort[key] === 'ascending' && !newSort) {
			sort[key] = 'descending'
		} else if(sort[key] === 'descending'){
			delete sort[key]
		}

		let sortedData = flatten(this.orignalPagedData)

		const sortKeys = Object.keys(sort)

		if(sortKeys.length > 0){
			sortedData = flatten(data)
			const direction = Object.values(sort).map(direction => direction === 'ascending' ? 'asc' : 'desc')
			return {
				sort,
				sortedData: orderBy(sortedData, sortKeys, direction)
			}
		}

		return ({
			sort,
			sortedData
		})
	}

	onSort = ({ key }) => {
		const {sort, sortedData} = this.sort(this.state.sort, key, this.pagedData)

		this.setState(Object.assign(this.state, {sort}))

		return this.search(sortedData, this.state.query)
	}

	search = (data, query) => {
		let searchedData = data

		if(data && Array.isArray(data) && query && query !== ''){
			const regex = new RegExp(query, 'i')
			searchedData = data.filter(row => Object.values(row).some(prop => regex.test(prop)))
		} else {
			searchedData = this.data
		}

		return this.setPagedData(searchedData)
	}

	paginate = (data) => {
		const dataCopy = [...data]
		const pages = []

		while (dataCopy.length) pages.push(dataCopy.splice(0, this.paginationLimit))

		return pages
	}

	setPagedData = (data) => {
		data = this.paginate(data)
		this.pagedData = data
		this.setState(Object.assign(this.state, { data: this.pagedData[this.state.index] }))
		return data
	}

	headerClass = key => this.state.sort[key] ? `sorted ${this.state.sort[key]}` : ''

	debouncedSearch = debounce((data, query) => (this.search(data, query)), 250)

	onSearch = (event, term) => {
		this.setState(Object.assign(this.state, {query: term.value}))
		this.debouncedSearch(flatten(this.pagedData), this.state.query)
	}

	render() {
		return (
			<div>
				{
				this.showSearch &&
					<Segment attached='top' floated="right">
						<Input icon='search' value={this.state.query || ''} onChange={this.onSearch} placeholder='Search...' />
					</Segment>
				}
				<Table /*className='sortable'*/ compact inverted unstackable striped  style={{marginBottom:1}}>
					<Table.Header>
						{
							(this.mainHeader !== "") &&
								<Table.Row>
									<Table.HeaderCell colSpan={this.columns.length}>{this.mainHeader}</Table.HeaderCell>
								</Table.Row>
						}
							{this.columns && this.renderHeader(this.columns, this.onSort, this.headerClass)}
					</Table.Header>
				</Table>
				<div  style={this.tableScrollHeight > 100?{display:'block',maxHeight:this.tableScrollHeight,overflowY:'auto'}:{}}>
				<Table /*className='sortable'*/ compact inverted unstackable striped >
					<Table.Body >
						{(this.data.length > 0) ? 
							this.state.data.map((item, idx) => this.renderRow(item, idx))
							:
							<Table.Row>
								<Table.Cell colSpan={this.columns.length} textAlign='center'>
									<b>No records found</b>
								</Table.Cell>
							</Table.Row>
						}
					</Table.Body>
					{this.pagedData.length > 1 &&
					<Table.Footer>
						<Table.Row>
							<Table.Cell colSpan={this.columns.length}>
								<Menu floated='right' pagination size='mini'>
									{this.state.index !== 0 && this.pagedData.length > 1 &&
									<Menu.Item onClick={() => this.pageChange('back')} as='a' icon>
										<Icon name='left chevron' />
									</Menu.Item>
									}
									{this.pagedData.map((dataSet, index) => {
										if(index > this.state.index-2 &&  index < this.state.index+2) {
											const active = index === this.state.index
											return (
												<Menu.Item key={index} active={active} onClick={() => this.pageChange(index)} as='a'>
													{index + 1}
												</Menu.Item>
											)
										}
									})}
									{this.state.index + 1 < this.pagedData.length &&
									<Menu.Item onClick={() => this.pageChange('next')} as='a' icon>
										<Icon name='right chevron' />
									</Menu.Item>
									}
								</Menu>
							</Table.Cell>
						</Table.Row>
						
					</Table.Footer>
					}
				</Table>
				</div>
			</div>
		)
	}
}
export default DataTable
