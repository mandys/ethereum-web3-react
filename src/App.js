import React, { Component } from 'react';
//import { promisifyAll } from 'bluebird'

import WithWeb3 from './WithWeb3';
//import ABIInterfaceArray from './util/ABI.json'

// import BnkGrid from './Bnkgrid'
import DisclaimerOverlay from './DisclaimerOverlay';
import { Grid, Container, Message } from 'semantic-ui-react'
// import BnkMessage from './Bnkmessage'
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';

//const SMART_CONTRACT_INSTANCE = '0xb3b18AfbE291E50E652ba5e3faFAbf0b566b804B'

//const instancePromisifier = (instance) => promisifyAll(instance, { suffix: 'Async'})
const parseEtherFromBalance = (web3, balance) => web3.fromWei(balance.toNumber(), 'ether')

//const constantsFromInterface = ABIInterfaceArray.filter( ABIinterface => ABIinterface.constant )
//const methodsFromInterface = ABIInterfaceArray.filter( ABIinterface => !ABIinterface.constant )

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accounts: [],
            accountsMap: {},
            connectedNetwork: undefined,
            showMetamaskLink:false,
            notify:{
                    message: "",
                    level: "greeen",
                    showMetamaskLink: false
                }
        }
    }
    async callInterface(interfaceName) {
        const { instance } = this.state;
        const response = await instance[`${interfaceName}Async`]();
        alert(`The result from calling ${interfaceName} is ${response}`);
    }
    
    async componentDidMount() {
        this.checkMetamaskInstalled();
    }

    checkMetamaskInstalled = () => {
        if(this.props.web3.currentProvider.isMetaMask === true) {
            this.checkConnection();
        } else {
            this.setState({ notify: {
                    message: "Metamask is required to use this site.",
                    level: 'red',
                    showMetamaskLink: true
                } 
            });
        }
    }
    
    checkConnection = () => {
        if(this.props.web3.isConnected()) {
            if(this.props.web3.currentProvider.isMetaMask !== true) {
                this.setState({ notify: {
                        message: "Metamask is required to use this site.",
                        level: 'red',
                        showMetamaskLink: true
                    } 
                });
            } else {
                this.getAccount();
            }
         } else {
            this.setState({ notify: {
                    message: "Metamask is required to use this site.",
                    level: 'red',
                    showMetamaskLink: true
                } 
            });
         }
    }
    
    
    getAccount = async() => {
        const accounts = await this.props.web3.eth.getAccountsAsync();
        if (accounts.length === 0) {
            console.log('no accounts found');
            this.setState({ notify: {
                    message: `Unlock your Metamask wallet to continue using Binkd! 
                        To unlock Metamask, select the fox icon in your Chrome browser bar and login.`,
                    level: 'red'
                } 
            });
        } else {
            this.setState({ accounts: accounts });
            this.getNetworkVersion();
        }
    }

    getNetworkVersion = async() => {
        console.log('checking network version...')
        const network = await this.props.web3.version.getNetworkAsync();
        let networkId;
        let message = "";
        let level = "orange";
        switch (network) {
            case "1":
                console.log("You are on Mainnet");
                networkId = 'Mainnet';
                break
            case "2":
                message = 'You are on deprecated Morden test network.';
                networkId = "Morden";
                break
            case "3":
                message = 'You are on ropsten test network.';
                networkId = "Ropsten";
                break
            case "4":
                message = 'You are on Rinkeby test network.';
                networkId = 'Rinkeby';
                break
            case "42":
                message = 'You are on Kovan test network.';
                networkId = "Kovan";
                break
            default:
                networkId = "Unknown"
                message = 'You are on unknown network.';
        }
        if(networkId !== "Mainnet") {
            if(message !== "") {
                message +=" Please switch to the Mainnet network.";
                this.setState({
                    notify: {
                        message: message,
                        level: level
                    } 
                });
            }
        }
        this.setState({ connectedNetwork: networkId });
        this.loadBalance(this.state.accounts[0]);
    }

    loadBalance = async(account) => {
        const balance = await parseEtherFromBalance(this.props.web3, await this.props.web3.eth.getBalanceAsync(account))
        const { accountsMap } = this.state;
        console.log('accountsMap', accountsMap);
        console.log('Balance for account', account, balance)
        this.setState({ accountsMap: Object.assign(accountsMap, { [account]: balance })});
        if(this.state.connectedNetwork === "Mainnet") {
            this.setState({
                notify: {
                    message: `Your account balance is ${balance}`,
                    level: 'success'
                } 
            });
        }
    }

    render() {
        return (
            <div className="App">
                <DisclaimerOverlay />
                    {
                    this.state.notify.message && 
                    <Container>
                        <Grid >
                            <Grid.Row className='left aligned'>
                                <Grid.Column width={10}>
                                    <Wallet 
                                        balance={this.state.accountsMap[this.state.accounts[0]]} 
                                    />
                                </Grid.Column>
                                <Grid.Column width={6} >
                                    <Message color={this.state.notify.level}>
                                        {this.state.notify.message}
                                        {
                                            this.state.notify.showMetamaskLink && 
                                                <span>To install Metamask <a rel="noopener noreferrer" href="https://metamask.io/" target="_blank">click here</a>.</span>
                                        }
                                    </Message>
                                    {
                                        !this.state.showMetamaskLink &&
                                            <div>
                                                <h5>Account Address</h5>
                                                    {this.state.accounts[0]}
                                                <h5>Account Balance</h5>
                                                    {this.state.accountsMap[this.state.accounts[0]]} ETH
                                                <h5>Transaction History</h5>
                                            </div>
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                    <Grid.Column width={16}>
                                        <TokenBalance />
                                    </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                    }
            </div>
        );
    }
}

export default WithWeb3(App);
