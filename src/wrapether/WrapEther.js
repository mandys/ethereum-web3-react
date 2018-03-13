import React, { Component } from 'react';
import { Header, Statistic, Segment,Divider, Button } from 'semantic-ui-react'
import {warap_ether_abi} from '../util/contracts/warap_ether_abi.js';
import WithWeb3 from '../WithWeb3';
import { ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';
// import * as Web3 from 'web3';

class WrapEther extends Component {
    state = {
        binkBalance: undefined, 
        binkSymbol: "WETH",
        contractAddr: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        zeroEx: null
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
    componentDidMount = async() => {
        this.getWrapEtherDetails();
        this.mainAsync()
    }

    getWrapEtherDetails = async() => {
        const address = "0x3E5E71BcD57FBAa46009493AC7ac2c6b2FBfC7CC";
        const contractAddress = this.state.contractAddr;
        const contractABI = warap_ether_abi;
        const tokenContract = this.props.web3.eth.contract(contractABI);
        console.log(tokenContract);
        const tokenContractInstance = tokenContract.at(contractAddress);
        console.log(tokenContractInstance);
        let tokenBalance = await this.getBalance(tokenContractInstance, address);
        let tokenDecimals = await this.getDecimals(tokenContractInstance, address);
        let tokenSymbol = await this.getSymbol(tokenContractInstance, address);
        tokenBalance = tokenBalance/Math.pow(10, tokenDecimals);
        console.log(tokenBalance);
        this.setState({
            binkBalance: tokenBalance.toFixed(2),
            binkSymbol: tokenSymbol,
        });
    }

    wrapEther= () => {
        this.state.zeroEx.etherToken.depositAsync(
            this.state.contractAddr,
            new BigNumber(this.props.web3.toWei(0.1, 'ether')),
            this.props.fromAddress
        ).then((response) => {
            console.log(response);
        })
    }

    unWrapEther= () => {
        this.state.zeroEx.etherToken.withdrawAsync(
            this.state.contractAddr,
            new BigNumber(this.props.web3.toWei(0.1, 'ether')),
            this.props.fromAddress
        ).then((response) => {
            console.log(response);
        })
    }

    bookOrder = () => {
        const order = {
            exchangeContractAddress: this.state.contractAddr, // Can be fetched from [zeroEx.exchange.getExchangeContractAddress](https://0xproject.com/docs/0xjs#getContractAddressAsync)
            // expirationUnixTimestampSec: BigNumber, // This is up to you
            // feeRecipient: string, // Specify the fee recepient address or use `ZeroEx.NULL_ADDRESS` to disable fees
            maker: this.props.fromAddress, // The address creating an order
            makerFee: new BigNumber(0), // Fee size the maker pays in Base Units or `new BigNumber(0)`
            makerTokenAddress: this.state.contractAddr,
            makerTokenAmount: new BigNumber(this.props.web3.toWei(0.1, 'ether')),
            salt: ZeroEx.generatePseudoRandomSalt(), // Use [ZeroEx.generatePseudoRandomSalt](https://0xproject.com/docs/0xjs#generatePseudoRandomSalt)
            taker: "0x4Bb05231389045fbfb633E93C01d2A9346289D06".toLowerCase(), // Taker address or `ZeroEx.NULL_ADDRESS` if you want anyone to be able to fill the order (most probably)
            takerFee: new BigNumber(0), // Fee size the taker pays in Base Units or `new BigNumber(0)`
            takerTokenAddress: this.state.contractAddr,
            takerTokenAmount: new BigNumber(this.props.web3.toWei(0.1, 'ether')),
        }
        console.log(order);
        console.log(ZeroEx.getOrderHashHex(order))
    }

    mainAsync = () => {
        const TESTRPC_NETWORK_ID = 50;
        const configs = {
            networkId: TESTRPC_NETWORK_ID,
        };
        this.setState({
            zeroEx: new ZeroEx(this.props.web3.currentProvider, configs)
        })
    };

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
   

    render() {
        return (
            <Segment  textAlign="center">
                <Header as='h2'>My Tokens</Header>
                <Statistic color='blue' horizontal>
                    <Statistic.Value>{this.state.binkBalance}</Statistic.Value>
                    <Statistic.Label>{this.state.binkSymbol}</Statistic.Label>
                </Statistic>
                <Divider/>
                <Button.Group >
                    <Button primary onClick={this.wrapEther}>Wrap Ether</Button>
                    <Button.Or />
                    <Button secondary onClick={this.unWrapEther}>Unwrap Ether</Button>
                </Button.Group>
                <Button onClick={this.bookOrder}>Order</Button>
            </Segment>
        )
    }
}

export default WithWeb3(WrapEther);
