import React, { Component } from 'react';
import { Container, Header, Button, Form } from 'semantic-ui-react'
import {human_standard_token_abi} from './util/human_standard_token_abi';
import WithWeb3 from './WithWeb3';
class TokenBalance extends Component {
    state = {
        tB: undefined,
        tS: undefined,
        tD: undefined
    } 
    getBalance = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.balanceOf(address, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }
    componentDidMount = () => {
        console.log("TOKEN BALANCE COMPONENT DID MOUNT");
        console.log(this.props);
    }
    getDecimals = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.decimals(function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }

    getSymbol = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.symbol(function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }
    saveTokenContractAddress = async (e) => {
        const address = '0x17014e6c188315da868fbc380e144b6c77036b45';
        const contractAddress = e.target.tokenContractAddress.value;
        console.log(`contractAddr is ${contractAddress} `);
        const contractABI = human_standard_token_abi;
        const tokenContract = this.props.web3.eth.contract(contractABI);
        const tokenContractInstance = tokenContract.at(contractAddress);
        let tokenBalance = await this.getBalance(tokenContractInstance, address);
        let tokenDecimals = await this.getDecimals(tokenContractInstance, address);
        let tokenSymbol = await this.getSymbol(tokenContractInstance, address);
        tokenBalance = tokenBalance/Math.pow(10, tokenDecimals);
        this.setState({
            tB: tokenBalance,
            tD: tokenDecimals,
            tS: tokenSymbol,
        });
        console.log(`tokenBalance is ${tokenBalance}`);
        console.log(`tokenDecimals are ${tokenDecimals}`);
        console.log(`tokenSymbol is ${tokenSymbol}`);
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
    }
    render() {
        return (
            <Container>
                <Header as='h2'>Token Balances</Header>
                <Form onSubmit={this.saveTokenContractAddress}>
                    <Form.Field required={true}>
                        <label>Token Contract Address</label>
                        <input placeholder='Token Contract Address' value="0x9C8579DaB8cdd2d66eC0fd7FA34457684Bfd977F" name="tokenContractAddress" onChange={this.handleInputChange} />
                    </Form.Field>
                    {
                        !this.state.tB && <Button color='blue'>Fetch Details</Button>
                    }
                    
                    {
                        this.state.tB && 
                            <div>
                                <Form.Field required={true}>
                                    <label>Token Symbol</label>
                                    <input placeholder='Token Symbol' name="tokenSymbol" onChange={this.handleInputChange} value={this.state.tS} />
                                </Form.Field>
                                <Form.Field required={true}>
                                    <label>Decimals</label>
                                    <input placeholder='Decimals' name="tokenDecimals" onChange={this.handleInputChange} value={this.state.tD} />
                                </Form.Field>
                                <Form.Field required={true}>
                                    <label>Tokens</label>
                                    <input placeholder='Tokens' name="tokenBalance" onChange={this.handleInputChange} value={this.state.tB} />
                                </Form.Field>
                                <Button type='submit'>Save</Button>
                            </div>
                    }
                </Form>
            </Container>
        )
    }
}

export default WithWeb3(TokenBalance);
