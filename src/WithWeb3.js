import React from 'react'
import getWeb3 from './util/getWeb3'

const parseEtherFromBalance = (web3, balance) => web3.fromWei(balance.toNumber(), 'ether')

const WithWeb3 = (PassedComponent) => class extends React.Component {
    state = {
        web3: null,
        fromAddress: '',
        balance: 0,
        notifications: {},
        connectedNetwork: undefined,
        showMetamaskLink:false,
        notify:{
                message: "",
                level: "greeen",
                showMetamaskLink: false
            }
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3()
            this.setState({web3})
            this.checkMetamaskInstalled();
        } catch (error) {
            alert(`Failed to load web3.`)
            console.log(error)
        }
    }

    checkMetamaskInstalled = () => {
        if(this.state.web3.currentProvider.isMetaMask === true) {
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
        if(this.state.web3.isConnected()) {
            if(this.state.web3.currentProvider.isMetaMask !== true) {
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
        const accounts = await this.state.web3.eth.getAccountsAsync();
        if (accounts.length === 0) {
            console.log('no accounts found');
            this.setState({ notify: {
                    message: `Unlock your Metamask wallet to continue using Binkd! 
                        To unlock Metamask, select the fox icon in your Chrome browser bar and login.`,
                    level: 'red'
                } 
            });
        } else {
            this.setState({ fromAddress: accounts[0] });
            this.getNetworkVersion();
        }
    }

    getNetworkVersion = async() => {
        console.log('checking network version...')
        const network = await this.state.web3.version.getNetworkAsync();
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
        this.loadBalance(this.state.fromAddress);
    }

    loadBalance = async(account) => {
        const balance = await parseEtherFromBalance(this.state.web3, await this.state.web3.eth.getBalanceAsync(account))
        this.setState({ balance });
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
        return this.state.web3 ? <PassedComponent {...this.state} {...this.props} /> : <div>Loading Web3</div>
    }
}

export default WithWeb3