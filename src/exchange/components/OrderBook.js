import React, { Component } from 'react';
import { Table,Header,Button } from 'semantic-ui-react'
import Exchange from '../Exchange';
import { ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';
var store = require('store')


class OrderBook extends Component {
    state = {
        orders:[]
    }
    DECIMALS = 18
    componentDidMount = async() => {
        let orders = {}
        orders = store.get("orders");
        if(orders && orders[`${this.props.from}:${this.props.to}`]) {
            console.log('filteredOrders',orders[`${this.props.from}:${this.props.to}`]);
            let neworders = []
            orders[`${this.props.from}:${this.props.to}`].map((order)=>{
                this.props.zeroEx.exchange.getUnavailableTakerAmountAsync(order.hash)
                    .then(response => {
                        let bal = parseFloat(order.toToken) - (response/Math.pow(10, this.DECIMALS))
                        console.log('orderstatus',bal);
                        if(bal > 0){
                            this.setState({
                                orders: neworders.concat(order)
                            })
                        }
                    }) .catch(err => {
                        console.log('orderstatus',err)
                        return false;
                    })
            }) 
            console.log('filteredOrders',neworders);
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
    }

    fillOrder = async(signedOrder, toAmount) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmount)
        try {
            const orderValidOrNot = ZeroEx.isValidOrderHash('0x16c70dcc13c40f679fa2cbd6dbfbb886ccac38334c756975fbc26c6fa264f434')
            console.log('orderValidOrNot', orderValidOrNot)
        } catch(e) {
            console.log(e)
        }
        const shouldThrowOnInsufficientBalanceOrAllowance = false;
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(toAmount), this.DECIMALS);
        // const signedOrder = this.convertPortalOrder(signedOrder);
        const txHash = await this.props.zeroEx.exchange.fillOrderAsync(
            this.convertPortalOrder(signedOrder),
            fillTakerTokenAmount,
            shouldThrowOnInsufficientBalanceOrAllowance,
            '0xb1f13818094091343c127945e2B894CeB2d3fd27'.toLowerCase()
        );
        console.log('txHash', txHash);
        // let transactions = {};
        // if(store.get("transactions")) {
        //     transactions = store.get("orders");
        // }
        // if(!transactions) {
        //     transactions = {}
        // }
        // transactions.push(txHash);
        console.log('txHash', txHash);
        const txReceipt = await this.props.zeroEx.awaitTransactionMinedAsync(txHash);
        console.log('FillOrder transaction receipt: ', txReceipt);
    }

    cancelOrder = async(signedOrder, toAmount) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmount)
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(toAmount), this.DECIMALS);
        // const signedOrder = this.convertPortalOrder(signedOrder);
        const txHash = await this.props.zeroEx.exchange.cancelOrderAsync(
            this.convertPortalOrder(signedOrder),
            fillTakerTokenAmount
        );
        console.log('txHash', txHash);
        console.log('txHash', txHash);
    }

    convertPortalOrder = (signedOrder) => {
        const rawSignedOrder = signedOrder;
        rawSignedOrder.makerFee = new BigNumber(rawSignedOrder.makerFee);
        rawSignedOrder.takerFee = new BigNumber(rawSignedOrder.takerFee);
        rawSignedOrder.makerTokenAmount = new BigNumber(rawSignedOrder.makerTokenAmount);
        rawSignedOrder.takerTokenAmount = new BigNumber(rawSignedOrder.takerTokenAmount);
        rawSignedOrder.expirationUnixTimestampSec = new BigNumber(rawSignedOrder.expirationUnixTimestampSec);
        rawSignedOrder.salt = new BigNumber(rawSignedOrder.salt);
        return rawSignedOrder;
    }
    orderstatus = async(orderHash, takerAmount) => {
        this.props.zeroEx.exchange.getUnavailableTakerAmountAsync(orderHash)
        .then(response => {
            let bal = parseFloat(takerAmount) - (response/Math.pow(10, this.DECIMALS))
            console.log('orderstatus',bal);
            return (bal > 0)?true:false
        }) .catch(err => {
            console.log('orderstatus',err)
            return false;
        })
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
                        <Table.HeaderCell>Action</Table.HeaderCell>
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
                                    <Table.Cell>
                                        <p>
                                            <Button onClick={() => this.fillOrder(order.signedOrder, order.toToken) }>Fill Order</Button>
                                        </p>
                                        <p>
                                            <Button onClick={() => this.cancelOrder(order.signedOrder, order.toToken) }>Cancel Order</Button>
                                        </p>
                                    </Table.Cell>
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

export default Exchange(OrderBook);