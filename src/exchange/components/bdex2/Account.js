import React, { Component } from 'react';
import { Header, Grid, Icon, Button, Table, Segment } from 'semantic-ui-react'
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import BdexUtil from '../../../util/bdex-utils'
class Account extends Component {
    bdexUtil = null;
    state = { 
        from:"ZRX",
        to:"WETH",
        balances: {
            'WETH': 'NIL',
            'ZRX': 'NIL',
            'BINK': 'NIL'
        },
        allowance: {
            'WETH': 0,
            'ZRX': 0,
            'BINK': 0
        },
        activeOders: [],
        filledOrders: [],
    }
    DECIMALS = 18
    componentDidMount = async() => {
        this.bdexUtil = new BdexUtil(this.props.web3, this.props.zeroEx);
        let activeOders = await this.bdexUtil.getActiveOrders();
        this.setState({
            activeOders: activeOders
        })
        
        let filledOders = await this.bdexUtil.getFilledOrders();
        this.setState({
            filledOders: filledOders
        })
        let balances = await this.bdexUtil.getBalances(this.props.ownerAddress, this.props.tokenContractAddresses);
        let allowance = await this.bdexUtil.getAllowances(this.props.ownerAddress, this.props.tokenContractAddresses);
        this.setState({
            balances: balances,
            allowance: allowance
        })
    }

    

    fillOrder = async(signedOrder, toAmountValue) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmountValue)
        try {
            const orderValidOrNot = ZeroEx.isValidOrderHash('0x16c70dcc13c40f679fa2cbd6dbfbb886ccac38334c756975fbc26c6fa264f434')
            console.log('orderValidOrNot', orderValidOrNot)
        } catch(e) {
            console.log(e)
        }
        const shouldThrowOnInsufficientBalanceOrAllowance = false;
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(parseFloat(toAmountValue)), this.DECIMALS);
        // const signedOrder = this.convertPortalOrder(signedOrder);
        const txHash = await this.props.zeroEx.exchange.fillOrderAsync(
            this.convertPortalOrder(signedOrder),
            fillTakerTokenAmount,
            shouldThrowOnInsufficientBalanceOrAllowance,
            this.props.ownerAddress
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

    cancelOrder = async(signedOrder, toAmountValue) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmountValue)
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(toAmountValue), this.DECIMALS);
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
    
    render() {
        return (
            <div>
                <Segment padded inverted>
                <Header inverted as='h2'>Your Account Overview</Header>
                </Segment>
                <Grid inverted columns={2} divided>
                    <Grid.Row stretched>
                        <Grid.Column>
                            <Table inverted striped>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan="4">Wallet Balances</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell width="4">Symbol</Table.Cell>
                                        <Table.Cell width="4">Asset</Table.Cell>
                                        <Table.Cell textAlign="right">Available Balance</Table.Cell>
                                        <Table.Cell textAlign="right">Unlocked</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell width="4">ZRX</Table.Cell>
                                        <Table.Cell width="4">0x</Table.Cell>
                                        <Table.Cell textAlign="right">{this.state.balances.ZRX === 'NIL' ? (
                                            <div><Icon name="spinner" /> Fetching Balanace</div>
                                        ) : this.state.balances.ZRX}</Table.Cell>
                                        <Table.Cell textAlign="right">
                                            {
                                                this.state.allowance.ZRX !== 0 ? <Icon name="unlock" /> :
                                                    (
                                                        <Button name="ZRX" icon onClick={this.takeAllowance}><Icon name="lock" /></Button>

                                                    )
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell width="4">WETH</Table.Cell>
                                        <Table.Cell width="4">Wrapped Ether</Table.Cell>
                                        <Table.Cell textAlign="right">{this.state.balances.WETH === 'NIL' ? (
                                            <div><Icon name="spinner" /> Fetching Balanace</div>
                                        ) : this.state.balances.WETH}</Table.Cell>
                                        <Table.Cell textAlign="right">
                                            {
                                                this.state.allowance.WETH !== 0 ? <Icon name="unlock" /> :
                                                    (
                                                        <Button name="WETH" icon onClick={this.takeAllowance}><Icon name="lock" /></Button>
                                                    )
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Grid.Column>
                        <Grid.Column>
                            <Table inverted striped columns='4'>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan="4">Open Orders</Table.HeaderCell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell>AMOUNT ZRX</Table.Cell>
                                        <Table.Cell>PRICE</Table.Cell>
                                        <Table.Cell>SUM IN USD</Table.Cell>
                                        <Table.Cell>ACTION</Table.Cell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                {
                                    this.state.activeOders.map((order,i) => {
                                        return (
                                            <Table.Row key={i}>
                                                <Table.Cell>{order.fromTokenValue}</Table.Cell>
                                                <Table.Cell>{order.toTokenValue}</Table.Cell>
                                                <Table.Cell>{order.toTokenValue}</Table.Cell>
                                                <Table.Cell>
                                                    <Button onClick={() => this.cancelOrder(order.signedOrder, order.toTokenValue) } negative>Cancel</Button> 
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })
                                }
                                </Table.Body>
                            </Table>
                            <Table inverted striped>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan="4">Filled Orders</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {
                                        this.state.filledOrders.map((order,i) => {
                                            return (
                                                <Table.Row key={i}>
                                                    <Table.Cell>{order.fromToken}</Table.Cell>
                                                    <Table.Cell>{order.toToken}</Table.Cell>
                                                    <Table.Cell>{order.hash}</Table.Cell>
                                                    
                                                </Table.Row>
                                            )
                                        })
                                    }
                                </Table.Body>
                            </Table>
                        </Grid.Column>

                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Account;