import React, { Component } from 'react';
//import { promisifyAll } from 'bluebird'

import { getWeb3Async } from './util/web3'
//import ABIInterfaceArray from './util/ABI.json'

import './App.css';

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
      loadingBalance: false
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
    console.log('getNetworkVersion')
    setTimeout(async () => {
      console.log('checking network version...')
      const network = await web3.version.getNetworkAsync();
      console.log(network);
    }, ARTIFICIAL_DELAY_IN_MS)
  }
  async loadBalance(account) {
    this.setState({ loadingBalance: true })
    setTimeout(async () => {
      const balance = await parseEtherFromBalance(this.state.web3, await this.state.web3.eth.getBalanceAsync(account))
      const { accountsMap } = this.state;
      console.log('Balance for account', account, balance)
      this.setState({ loadingBalance: false, accountsMap: Object.assign(accountsMap, { [account]: balance } ) })
    }, ARTIFICIAL_DELAY_IN_MS)
  }
  async componentDidMount() {
    const web3 = await getWeb3Async()
    if(web3.isConnected()) {
      
      //const abi = await web3.eth.contract(ABIInterfaceArray)
      //const instance = instancePromisifier(abi.at(SMART_CONTRACT_INSTANCE))
      
      //console.log('Interface', ABIInterfaceArray)
      
      this.setState({ web3: web3, isWeb3synced: true }, () => {
        this.setState({ loadingAccounts: true })
        setTimeout(async () => {
          this.getNetworkVersion(web3);
          console.log('Loading accounts...')
          const accounts = await web3.eth.getAccountsAsync();
          if ( accounts.length === 0 ) {
            console.log('no accounts found');
          }
          console.log('Accounts loaded.')
          console.log(accounts);
          this.setState({ loadingAccounts: false, accounts: accounts })
        }, ARTIFICIAL_DELAY_IN_MS)
      })
      
    }
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Web3.js React Integration Example</h1>
        </header>
        { 
          this.state.isWeb3synced ?
          <div className="App-wrapper">
            <p className="App-intro">
              MetaMask was loaded properly.
            </p>
            { this.state.loadingAccounts && <span>We are loading your accounts...</span> }
            { 
              this.state.accounts.length > 0 && 
                <div>
                  <span>Your accounts are: </span>
                  { 
                    this.state.accounts.map( account => 
                      (
                      <pre key={account}> 
                        Account: { account }
                        <br/>
                        Balance: 
                        {
                          this.state.loadingBalance ? ' Loading your balance ' :
                          this.state.accountsMap[account] ?
                          ` ${this.state.accountsMap[account]} ETH ` : ' N/A ETH '
                        }
                        <button onClick={() => this.loadBalance(account)}>Get Balance</button>
                      </pre>
                      )
                    )
                  }
                </div>
            }
            {
              !this.state.loadingAccounts && <div>You dont seem to have any accounts</div>
            }
          </div>
          :
          <p className="App-intro">
            To get started, connect to your MetaMask account
          </p>
        }
      </div>
    );
  }
}

export default App;
