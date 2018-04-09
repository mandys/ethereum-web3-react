import React, { Component } from 'react';
import { Header, Grid, Icon, Button, Table, Segment, Label, Divider } from 'semantic-ui-react'
import DataTable from '../../../util/Datatable'
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';

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
        userActiveOrders: [],
        userFilledOrders: [],
    }
    DECIMALS = 18
    
    componentDidMount = async() => {
        let activeOders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'active');
        this.setState({
            userActiveOrders: activeOders
        })
        
        let filledOders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'filled');
        this.setState({
            userFilledOrders: filledOders
        })
        let balances = await this.props.bdexUtil.getBalances(this.props.ownerAddress, this.props.tokenContractAddresses);
        let allowance = await this.props.bdexUtil.getAllowances(this.props.ownerAddress, this.props.tokenContractAddresses);
        let prices = await this.props.bdexUtil.getMarketPrices();
        this.setState({
            balances: balances,
            allowance: allowance,
            prices: prices
        })

        this.props.bdexUtil.socketUtil.socket.on('cancelorder', (orderhash) => {
            console.log("cancelorder LOGGED")
            let userActiveOrders = this.state.userActiveOrders.filter((order) => {
                if(order.hash !== orderhash) {
                    return true
                }
                return false;
            })
           
            this.setState({
                userActiveOrders: userActiveOrders
            }) 
        })
    }
    
    render() {
        let userActiveOrders = [];
        let userFilledOrders = [];
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
                        
                        {
                            this.state.userActiveOrders.forEach((order,i) => {
                                userActiveOrders.push({
                                        amount: order.fromTokenValue,
                                        price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                    {order.toTokenValue}
                                                </Label>,
                                        sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                        action: <Button 
                                                onClick={() => this.props.bdexUtil.cancelOrder(order.signedOrder, order.toTokenValue, order.hash) } 
                                                negative
                                                >
                                                    Cancel
                                                </Button> 
                                    })
                                })
                        }
                            <DataTable
                                data={userActiveOrders}
                                header
                                mainHeader={`Open Orders`}
                                columns={[
                                            {key:"amount", display:"AMOUNT"},
                                            {key:"price", display:"PRICE"},
                                            {key:"sum", display:"SUM IN USD",colSpan:2},
                                            {key:"action"}
                                        ]}
                                pageLimit={4}
                            />
                            <Divider />
                            {
                                this.state.userFilledOrders.forEach((order,i) => {
                                    userFilledOrders.push({
                                            amount: order.fromTokenValue,
                                            price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                        {order.toTokenValue}
                                                    </Label>,
                                            sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                        })
                                    })
                            }
                                <DataTable
                                    data={userFilledOrders}
                                    header
                                    mainHeader='Filled Orders'
                                    columns={[
                                                {key:"amount", display:"AMOUNT"},
                                                {key:"price", display:"PRICE"},
                                                {key:"sum", display:"SUM IN USD"},
                                            ]}
                                    pageLimit={4}
                                />
                        </Grid.Column>

                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Account;