import React, { Component } from 'react';
import { Table,Container,Checkbox } from 'semantic-ui-react'
import Exchange from '../Exchange';
import WrapUnWrapEther from './WrapUnWrapEther';

class WalletBalance extends Component {
    state = {
        disabled: false
    }

    takeAllowance = async(e, token) => {
        this.setState({
            disabled:true
        })
        console.log('inside getAllowanceFromMaker');
        console.log(this.props.tokenContractAddresses[token]);
        try {
            const setMakerAllowTxHash = await this.props.zeroEx.token.setUnlimitedProxyAllowanceAsync(this.props.tokenContractAddresses[token], this.props.ownerAddress);
            console.log('setMakerAllowTxHash', setMakerAllowTxHash);
            await this.props.zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash);
            this.setState({
                disabled:false
            })
        } catch(e) {
            this.setState({
                disabled:false
            })
        }
    }

    render() {
        return (
            <Container>
                <Table celled inverted selectable>
                    <Table.Header>
                    <Table.Row>				
                        <Table.HeaderCell>Symbol</Table.HeaderCell>
                        <Table.HeaderCell>Asset</Table.HeaderCell>
                        <Table.HeaderCell>Unlocked</Table.HeaderCell>
                        <Table.HeaderCell>Avail. Balances</Table.HeaderCell>
                        <Table.HeaderCell>Value (USD)</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    	 		
                    <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            ETH &emsp;
                            <WrapUnWrapEther from="ETH" to="WETH" />
                        </Table.Cell>
                        <Table.Cell>Ether</Table.Cell>
                        <Table.Cell>—</Table.Cell>
                        <Table.Cell>0.00000000</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            WETH &emsp;
                            <WrapUnWrapEther from="WETH" to="ETH"/>
                        </Table.Cell>
                        <Table.Cell>Wrapped Ether</Table.Cell>
                        <Table.Cell>
                            <Checkbox toggle onChange={(e) => this.takeAllowance(e, 'WETH')} disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>0.00000000</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>BINK</Table.Cell>
                        <Table.Cell>Bink Token</Table.Cell>
                        <Table.Cell>
                            <Checkbox toggle onChange={(e) => this.takeAllowance(e, 'BINK')} disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>0.00000000</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>ZRX</Table.Cell>
                        <Table.Cell>0x</Table.Cell>
                        <Table.Cell>
                            <Checkbox toggle onChange={(e) => this.takeAllowance(e, 'ZRX')} disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>0.00000000</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default Exchange(WalletBalance);