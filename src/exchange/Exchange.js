import React, { Component } from 'react';
import Web3 from 'web3';
import { InjectedWeb3Subprovider } from '@0xproject/subproviders';
import { ZeroEx } from '0x.js';
import { Dimmer, Loader } from 'semantic-ui-react'
import KovanPopup from './components/bdex2/KovanPopup'
const Web3ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')
const Promise = require('bluebird');


const Exchange = (PassedComponent) => class extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            zeroEx : null,
            tokenContractAddresses: {},
            ownerAddress:'',
            showKovanPopup:false
         };
        this.NETWORK_ID = 42;
        this.providerEngine = new Web3ProviderEngine();
        if ( typeof window.web3 !== 'undefined' ) {
            this.providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
            window.web3.version.getNetwork((err, networkId)=>{
                if(networkId !== '42'){
                  this.setState({ showKovanPopup: true })
                }
            })
        }
    
        this.providerEngine.addProvider(new RpcSubprovider({
            // rpcUrl: 'http://54.219.243.226:8545/',
            rpcUrl: 'https://kovan.infura.io/SNWrFm1CMX7BfYqvkFXf',
        }))
          
        this.providerEngine.start();
        this.web3 = new Web3(this.providerEngine);
        if (typeof this.web3.eth.getAccountsPromise === 'undefined') {
            Promise.promisifyAll(this.web3.eth, { suffix: 'Async' });
        }
        console.log(this.web3);
    }
    componentDidMount = async() => {
        const zeroEx = new ZeroEx(this.providerEngine, { networkId: this.NETWORK_ID });
        const WETH_ADDRESS = await zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync('WETH');
        console.log('WETH_ADDRESS', WETH_ADDRESS);
        const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress();
        console.log('ZRX_ADDRESS', ZRX_ADDRESS);
        const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
        console.log('EXCHANGE_ADDRESS', EXCHANGE_ADDRESS);
        const addresses = await zeroEx.getAvailableAddressesAsync();
        // const tokens = await zeroEx.tokenRegistry.getTokensAsync();
        // console.log('tokens', tokens)
        let address = addresses[0];
        console.log('address', address)
        if ( !address ) {
            address = ''
        }
        /**
         * Below code is for monitoring change of accounts
         * or locking/unlocking of metamask
         */
        const accountSwitchWatcher = setInterval(async() => {
            const addresses = await zeroEx.getAvailableAddressesAsync()
            let newAddress;
            if ( addresses.length > 0 ) {
                newAddress = addresses[0]
            } else {
                newAddress = ''
            }
            this.setState((prevState) => {
                if ( prevState.ownerAddress !== newAddress) {
                    console.log('prevState', prevState)
                    return {
                        ownerAddress: newAddress
                    }
                }
            })
        }, 1000)
        this.setState(() => {
            return {
                zeroEx: zeroEx,
                tokenContractAddresses :{
                    WETH: WETH_ADDRESS,
                    ZRX: ZRX_ADDRESS,
                    BINK: '0xabc24cbf6b214764b91c2386479afd83c983d6d7',
                },
                exchangeAddress: EXCHANGE_ADDRESS,
                ownerAddress: address
            }
        }, () => {
            console.log('callback triggered, so setstate has fired')
            console.log(this.state.zeroEx); 
        })
    }

    render() {

        return (
            <div>
                {
                    this.state.zeroEx ? <PassedComponent {...this.state} {...this.props} web3={this.web3} /> :
                    <Dimmer active>
                        <Loader size='massive'>Loading</Loader>
                    </Dimmer>
                }
                <KovanPopup showKovanPopup={this.state.showKovanPopup}/>
            </div>
        )
    }
}

export default Exchange;