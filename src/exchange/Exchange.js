import React, { Component } from 'react';
import { BigNumber } from '@0xproject/utils';
import Web3 from 'web3';
import { promisify } from '@0xproject/utils';
import { InjectedWeb3Subprovider } from '@0xproject/subproviders';
import { ZeroEx } from '0x.js';
const Web3ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')



class Exchange extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
        this.NETWORK_ID = 42;
        this.providerEngine = new Web3ProviderEngine();
        this.providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
        this.providerEngine.addProvider(new RpcSubprovider({
            rpcUrl: 'https://rinkeby.infura.io/SNWrFm1CMX7BfYqvkFXf',
          }))
          
          this.providerEngine.start();
          this.web3 = new Web3(this.providerEngine);
    }
    componentDidMount = () => {
        const zeroEx = new ZeroEx(this.providerEngine, { networkId: this.NETWORK_ID });
        console.log(zeroEx);

        const DECIMALS = 18;
        let signedOrder = '';
        const WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists();
        console.log('WETH_ADDRESS', WETH_ADDRESS);
        const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress();
        console.log('ZRX_ADDRESS', ZRX_ADDRESS);
        const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
        console.log('EXCHANGE_ADDRESS', EXCHANGE_ADDRESS);
    }
    render() {
        return (
            <div>
                <h1>Welcome to the Exchange</h1>
            </div>
        );
    }
}

export default Exchange;