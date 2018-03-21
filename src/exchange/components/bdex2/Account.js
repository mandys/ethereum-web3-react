import React, { Component } from 'react';
import { Header, Grid, Icon, Button, Table } from 'semantic-ui-react'

class Account extends Component {
    state = { 
        activeItem: 'Welcome',
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
    }
    DECIMALS = 18
    render() {
        return (
            <div>
                <Header inverted as='h2'>Your Account Overview</Header>
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
                                        <Table.Cell textAlign="right">{this.state.balances.ZRX == 'NIL' ? (
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
                                        <Table.Cell textAlign="right">{this.state.balances.WETH == 'NIL' ? (
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
                            <Table inverted striped>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan="3">Open Orders</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell textAlign='center'>You have no open orders.</Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                            <Table inverted striped>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan="3">Filled Orders</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell textAlign='center'>You have no filled orders.</Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Grid.Column>

                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Account;<div><h1>Accounts Info</h1></div>