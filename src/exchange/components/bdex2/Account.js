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
        prices:{
            "WETH":0
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
        let prices = await this.bdexUtil.getMarketPrices();
        this.setState({
            balances: balances,
            allowance: allowance,
            prices: prices
        })
    }

    cancelOrder = async(signedOrder, toAmountValue) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmountValue)
        try {
            const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(toAmountValue), this.DECIMALS);
            // const signedOrder = this.convertPortalOrder(signedOrder);
            const txHash = await this.props.zeroEx.exchange.cancelOrderAsync(
                this.bdexUtil.convertPortalOrder(signedOrder),
                fillTakerTokenAmount
            );
            console.log('txHash', txHash);
        } catch (e) {
            console.log(e)
        }
        
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
                                                <Table.Cell>{order.toTokenValue*this.state.prices['WETH']}</Table.Cell>
                                                <Table.Cell>
                                                    <Button onClick={() => this.bdexUtil.cancelOrder(order.signedOrder, order.toTokenValue) } negative>Cancel</Button> 
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
                                                    <Table.Cell>{order.hash*this.state.wethPrice}</Table.Cell>
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