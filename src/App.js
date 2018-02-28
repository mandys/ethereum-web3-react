import React, { Component } from 'react';
//import { promisifyAll } from 'bluebird'

import { getWeb3Async } from './util/web3'
//import ABIInterfaceArray from './util/ABI.json'

// import BnkGrid from './Bnkgrid'
import DisclaimerOverlay from './DisclaimerOverlay';
import { Grid, Container, Message } from 'semantic-ui-react'
// import BnkMessage from './Bnkmessage'
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';

//const SMART_CONTRACT_INSTANCE = '0xb3b18AfbE291E50E652ba5e3faFAbf0b566b804B'
const ARTIFICIAL_DELAY_IN_MS = 1000

//const instancePromisifier = (instance) => promisifyAll(instance, { suffix: 'Async'})
const parseEtherFromBalance = (web3, balance) => web3.fromWei(balance.toNumber(), 'ether')

//const constantsFromInterface = ABIInterfaceArray.filter( ABIinterface => ABIinterface.constant )
//const methodsFromInterface = ABIInterfaceArray.filter( ABIinterface => !ABIinterface.constant )




class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            instance: null,
            isWeb3synced: false,
            accounts: [],
            accountsMap: {},
            loadingAccounts: false,
            loadedAccounts: false,
            loadingBalance: false,
            connectedNetwork: undefined,
            notify:{
                    message: "",
                    level: "greeen",
                    showMetamaskLink: false
                }
        }
        this.loadBalance = this.loadBalance.bind(this)
        this.callInterface = this.callInterface.bind(this)
        this.getNetworkVersion = this.getNetworkVersion.bind(this)
    }
    async callInterface(interfaceName) {
        const { instance } = this.state;
        const response = await instance[`${interfaceName}Async`]();
        alert(`The result from calling ${interfaceName} is ${response}`);
    }
    async getNetworkVersion(web3) {
        setTimeout(async () => {
            console.log('checking network version...')
            const network = await web3.version.getNetworkAsync();
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
                    this.setState({ connectedNetwork: networkId,
                        notify: {
                            message: message,
                            level: level
                        } 
                    });
                }
            } else { 
                if(this.state.accounts[0]) {
                    this.setState({ notify: {
                        message: `You are on ${networkId}. Selected account is ${this.state.accounts[0]}`,
                        level: 'green'
                        } 
                        
                    });
                    this.loadBalance(this.state.accounts[0]);
                }
            }
            this.setState({ connectedNetwork: networkId
                        });
        }, ARTIFICIAL_DELAY_IN_MS)
    }

    async loadBalance(account) {
        this.setState({ loadingBalance: true })
        setTimeout(async () => {
            const balance = await parseEtherFromBalance(this.state.web3, await this.state.web3.eth.getBalanceAsync(account))
            const { accountsMap } = this.state;
            console.log('accountsMap', accountsMap);
            console.log('Balance for account', account, balance)
            this.setState({ loadingBalance: false, accountsMap: Object.assign(accountsMap, { [account]: balance }),
            notify: {
                message: "You are account balance "+balance,
                level: 'green'
            } 
            })
            }, ARTIFICIAL_DELAY_IN_MS)
    }
    async componentDidMount() {
        const web3 = await getWeb3Async()
        if (web3.isConnected()) {

            //const abi = await web3.eth.contract(ABIInterfaceArray)
            //const instance = instancePromisifier(abi.at(SMART_CONTRACT_INSTANCE))

            //console.log('Interface', ABIInterfaceArray)
            if(web3.currentProvider.isMetaMask !== true) {
                this.setState({ notify: {
                        message: "Metamask is required to use this site.",
                        level: 'red',
                        showMetamaskLink: true
                    } 
                });
            } else {
                this.getNetworkVersion(web3);
                this.setState({ web3: web3, isWeb3synced: true }, () => {
                    this.setState({ loadingAccounts: true })
                    setTimeout(async () => {
                        console.log('Loading accounts...')
                        const accounts = await web3.eth.getAccountsAsync();
                        if (accounts.length === 0) {
                            console.log('no accounts found');
                            this.setState({ notify: {
                                    message: "Unlock your Metamask wallet to continue using Binkd! To unlock Metamask, select the fox icon in your Chrome browser bar and login.",
                                    level: 'red'
                                } 
                            });
                        }  
                        console.log(accounts);
                        this.setState({ loadingAccounts: false, accounts: accounts, loadedAccounts: true })
                    }, ARTIFICIAL_DELAY_IN_MS)
                })
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
                                        fromAddress={this.state.accounts[0]} 
                                        balance={this.state.accountsMap[this.state.accounts[0]]} 
                                        web3={this.state.web3} 
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

export default App;
