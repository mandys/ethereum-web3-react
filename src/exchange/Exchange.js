import React, { Component } from 'react';
import { BigNumber } from '@0xproject/utils';
import Web3 from 'web3';
import { promisify } from '@0xproject/utils';
import { InjectedWeb3Subprovider } from '@0xproject/subproviders';
import { ZeroEx } from '0x.js';
import WalletBalance from './components/WalletBalances';
const Web3ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')



class Exchange extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            zeroEx : null,
            tokenContractAddresses: {},
            ownerAddress:''
         };
        this.NETWORK_ID = 42;
        this.providerEngine = new Web3ProviderEngine();
        this.providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
        this.providerEngine.addProvider(new RpcSubprovider({
            rpcUrl: 'https://rinkeby.infura.io/SNWrFm1CMX7BfYqvkFXf',
        }))
          
        this.providerEngine.start();
        this.web3 = new Web3(this.providerEngine);
    }
    componentDidMount = async() => {
        const zeroEx = new ZeroEx(this.providerEngine, { networkId: this.NETWORK_ID });
        const DECIMALS = 18;
        let signedOrder = '';
        const WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists();
        console.log('WETH_ADDRESS', WETH_ADDRESS);
        const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress();
        console.log('ZRX_ADDRESS', ZRX_ADDRESS);
        const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
        console.log('EXCHANGE_ADDRESS', EXCHANGE_ADDRESS);
        const addresses = await zeroEx.getAvailableAddressesAsync();
        // const tokens = await zeroEx.tokenRegistry.getTokensAsync();
        // console.log('tokens', tokens)
        const address = addresses[0];
        this.setState(() => {
            return {
                zeroEx: zeroEx,
                tokenContractAddresses :{
                    WETH: WETH_ADDRESS,
                    ZRX: ZRX_ADDRESS,
                    EXCHANGE_ADDRESS: EXCHANGE_ADDRESS,
                    BINK: '0xabc24cbf6b214764b91c2386479afd83c983d6d7',
                },
                ownerAddress: address
            }
        }, () => {
            console.log('callback triggered, so setstate has fired')
            console.log(this.state.zeroEx); 
        })
    }

    render() {
        return (
            <WalletBalance {...this.state}/>
        );
    }
}

export default Exchange;