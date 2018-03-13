import React, { Component } from 'react';
import { Header, Statistic, Segment } from 'semantic-ui-react'
import {rinkibey_abi} from '../util/contracts/rinkibey_abi.js';
import WithWeb3 from '../WithWeb3';

class BinkToken extends Component {
    state = {
        binkBalance: undefined,
        binkSymbol: "BINK",
        contractAddr: "0x11DF71e89a5D8C4237D9F19f76CD1CF54d7b9c89"
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
        try{
            const address = "0x4Bb05231389045fbfb633E93C01d2A9346289D06";
            const contractAddress = this.state.contractAddr;
            console.log(`contractAddr is ${contractAddress} `);
            const contractABI = rinkibey_abi;
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
                binkBalance: Math.round(tokenBalance),
                binkSymbol: tokenSymbol,
            });
        } catch (e) {
            console.log(e);
        }
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

    render() {
        return (
            <Segment  textAlign="center">
                <Header as='h2'>My Tokens</Header>
                <Statistic color='blue' horizontal>
                    <Statistic.Value>{this.state.binkBalance}</Statistic.Value>
                    <Statistic.Label>{this.state.binkSymbol}</Statistic.Label>
                </Statistic>
                
            </Segment>
                
        )
    }
}

export default WithWeb3(BinkToken);
