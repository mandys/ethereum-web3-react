import React, { Component } from 'react';
import { Table,Container,Checkbox, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';

class WalletBalance extends Component {
    state = {
        disabled: false
    }

    takeAllowance = async(e, token) => {
        this.setState({
            disabled:true
        })
        console.log('inside getAllowanceFromMaker');
        const setMakerAllowTxHash = await this.props.zeroEx.token.setUnlimitedProxyAllowanceAsync(this.props.tokenContractAddresses[token], this.props.ownerAddress);
        console.log('setMakerAllowTxHash', setMakerAllowTxHash);
        try{
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

    wrapEther = async (e, token) => {
        const ethAmount = new BigNumber(0.1);
        const ethToConvert = ZeroEx.toBaseUnitAmount(ethAmount, 18); // Number of ETH to convert to WETH
        console.log('ethToCovert', ethToConvert);
        const convertEthTxHash = await this.props.zeroEx.etherToken.depositAsync(this.props.tokenContractAddresses[token], ethToConvert, this.props.ownerAddress);
        console.log('convertEthTxHash', convertEthTxHash);
        await this.props.zeroEx.awaitTransactionMinedAsync(convertEthTxHash);
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
                            <Button size='mini' onClick={(e) => this.wrapEther(e, 'WETH')} >
                                Wrap
                            </Button>
                        </Table.Cell>
                        <Table.Cell>Ether</Table.Cell>
                        <Table.Cell>—</Table.Cell>
                        <Table.Cell>0.00000000</Table.Cell>
                        <Table.Cell>$0.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            WETH &emsp;
                            <Button size='mini' >
                                UnWrap
                            </Button>
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

export default WalletBalance;