import React, { Component } from 'react';
//import { promisifyAll } from 'bluebird'

import { getWeb3Async } from './util/web3'
//import ABIInterfaceArray from './util/ABI.json'
import { Container, Menu, Header, Button, Form } from 'semantic-ui-react'
import './App.css';

//const SMART_CONTRACT_INSTANCE = '0xb3b18AfbE291E50E652ba5e3faFAbf0b566b804B'
const ARTIFICIAL_DELAY_IN_MS = 1000

//const instancePromisifier = (instance) => promisifyAll(instance, { suffix: 'Async'})
const parseEtherFromBalance = (web3, balance) => web3.fromWei(balance.toNumber(), 'ether')

//const constantsFromInterface = ABIInterfaceArray.filter( ABIinterface => ABIinterface.constant )
//const methodsFromInterface = ABIInterfaceArray.filter( ABIinterface => !ABIinterface.constant )


class Wallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            isWeb3synced: false,
            accounts: [],
            loadedAccounts: false,
            loadingBalance: false,
            fromAddress: ''
        }
        this.generateTransaction = this.generateTransaction.bind(this);
    }
    async generateTransaction(e) {
        e.preventDefault();
        console.log('generateTransaction called');
        const fromAddress = e.target.fromAddress.value;
        const toAddress = e.target.toAddress.value;
        const amountToSend = e.target.amountToSend.value;
        console.log(amountToSend);
        const tx = await this.state.web3.eth.sendTransactionAsync({
            from: fromAddress,
            to: toAddress,
            value: amountToSend
        });
        console.log(tx);
    }
    async loadBalance(account) {
        this.setState({ loadingBalance: true })
        setTimeout(async () => {
            const balance = await parseEtherFromBalance(this.state.web3, await this.state.web3.eth.getBalanceAsync(account))
            const { accountsMap } = this.state;
            console.log('Balance for account', account, balance)
            this.setState({ loadingBalance: false, accountsMap: Object.assign(accountsMap, { [account]: balance }),
            })
            }, ARTIFICIAL_DELAY_IN_MS)
    }
    handleChange(event) {
        this.setState({fromAddress: event.target.value});
      }
    async componentDidMount() {
        const web3 = await getWeb3Async()
        if (web3.isConnected()) {
            this.setState({ web3: web3, isWeb3synced: true }, () => {
                setTimeout(async () => {
                    console.log('Loading accounts...')
                    const accounts = await web3.eth.getAccountsAsync();
                    if (accounts.length === 0) {
                        console.log('no accounts found');
                    }  
                    console.log(accounts);
                    this.setState({ loadingAccounts: false, accounts: accounts, loadedAccounts: true, fromAddress: accounts[0] })
                }, ARTIFICIAL_DELAY_IN_MS)
            })

        }
    }
    render() {
        return (
            <Container>
                <Menu>
                    <Menu.Item
                        name='editorials'
                    >
                    Editorials
                    </Menu.Item>
                </Menu>
                <Header as='h1'>Send Ether & Tokens</Header>
                <Form onSubmit={this.generateTransaction}>
                    <Form.Field>
                        <label>From Address</label>
                        <input placeholder='From Address' value={this.state.fromAddress} name="fromAddress" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>To Address</label>
                        <input placeholder='To Address' name="toAddress" />
                    </Form.Field>
                    <Form.Field>
                        <label>Amount to Send</label>
                        <input placeholder='Enter the amount' name="amountToSend" />
                    </Form.Field>
                    <Button type='submit'>Generate Transaction</Button>
            </Form>
            </Container>
        );
    }
}

export default Wallet;
