import React, { Component } from 'react';
import { Table,Container,Checkbox } from 'semantic-ui-react'
import Exchange from '../Exchange';
import WrapUnWrapEther from './WrapUnWrapEther';

class WalletBalance extends Component {
    state = {
        disabled: false,
        balances: {
            'WETH': 0,
            'ZRX': 0,
            'BINK': 0
        },
        allowance: {
            'WETH': 0,
            'ZRX': 0,
            'BINK': 0
        }
    }
    DECIMALS = 18
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

    componentDidMount = () => {
        this.getBalances();
        this.getAllowances();
        // zeroEx.token.getProxyAllowanceAsync
    }

    getAllowances = async() => {
        console.log(this.props.tokenContractAddresses);
        let allowance = {}
        for(var key in this.props.tokenContractAddresses) {
        console.log(allowance);
            allowance[key] = await this.props.zeroEx.token.getProxyAllowanceAsync(
                this.props.tokenContractAddresses[key], 
                this.props.ownerAddress
            )
            allowance[key] = allowance[key]/Math.pow(10, this.DECIMALS)
        }
        console.log('alowance',allowance);
        this.setState({
            allowance:allowance
        })
        
    }

    getBalances = async() => {
        console.log(this.props.tokenContractAddresses);
        let balances = {}
        for(var key in this.props.tokenContractAddresses) {
            balances[key] = await this.getTokenBalance(this.props.tokenContractAddresses[key])
        }
        console.log(balances);
        this.setState({
            balances:balances
        })
    }

    getTokenBalance = async(tokenAddress) => {
        let balance = await this.props.zeroEx.token.getBalanceAsync(tokenAddress, this.props.ownerAddress);
        let tokenBalance = balance/Math.pow(10, this.DECIMALS)
        return tokenBalance;
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
                            <Checkbox toggle 
                            checked={this.state.allowance['WETH']}
                            onChange={(e) => this.takeAllowance(e, 'WETH')} 
                            disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>{this.state.balances['WETH']}</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>BINK</Table.Cell>
                        <Table.Cell>Bink Token</Table.Cell>
                        <Table.Cell>
                            <Checkbox toggle 
                            checked={this.state.allowance['BINK']}
                            onChange={(e) => this.takeAllowance(e, 'BINK')} 
                            disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>{this.state.balances['BINK']}</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>ZRX</Table.Cell>
                        <Table.Cell>0x</Table.Cell>
                        <Table.Cell>
                            <Checkbox toggle 
                            checked={this.state.allowance['ZRX']}
                            onChange={(e) => this.takeAllowance(e, 'ZRX')} 
                            disabled={this.state.disabled}/>
                        </Table.Cell>
                        <Table.Cell>{this.state.balances['ZRX']}</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    
                    </Table.Body>
                </Table>
                
            </Container>
        );
    }
}

export default Exchange(WalletBalance);