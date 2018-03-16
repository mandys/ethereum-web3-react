import React, { Component } from 'react';
import { Table,Header } from 'semantic-ui-react'
var store = require('store')

class OrderBook extends Component {
    state = {
        orders:[]
    }
    componentDidMount = async() => {
        let orders = {}

        orders = store.get("orders");

        if(orders && orders[`${this.props.from}:${this.props.to}`]) {
            this.setState({
                orders: orders[`${this.props.from}:${this.props.to}`]
            })
        } else {
            this.setState({
                orders: []
            })
        }
    }

    componentDidUpdate = async(prevProps, prevState) => {
        console.log(this.props);
        console.log(prevProps);
        if(prevProps.from !== this.props.from ) {
            let orders = {}
            if (typeof(Storage) !== "undefined") { 
                orders = store.get("orders");
            }
            if(orders[`${this.props.from}:${this.props.to}`]) {
                this.setState({
                    orders: orders[`${this.props.from}:${this.props.to}`]
                })
            } else {
                this.setState({
                    orders: []
                })
            }
        }
    }
    
    render() {
        return (
            <div>
                <Header>ORDER BOOK - {this.props.from}:{this.props.to}</Header>
                <Table singleLine>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Amount {this.props.from}</Table.HeaderCell>
                        <Table.HeaderCell>Amount {this.props.to}</Table.HeaderCell>
                        <Table.HeaderCell>Order #</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {
                        this.state.orders.map((order,i) => {
                            return (
                                <Table.Row key={i}>
                                    <Table.Cell>{order.fromToken}</Table.Cell>
                                    <Table.Cell>{order.toToken}</Table.Cell>
                                    <Table.Cell>{order.hash}</Table.Cell>
                                    <Table.Cell>pending</Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                    </Table.Body>
                </Table>
            </div>
        );
    }
}

export default OrderBook;