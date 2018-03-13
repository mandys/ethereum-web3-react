import * as React from 'react';
import { render } from 'react-dom';
import Welcome from './Welcome';
import Account from './Account';
import Web3Actions from './Web3Actions';
import Faucet from './Faucet';
import InstallMetamask from './InstallMetamask';
import * as Web3 from 'web3';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc';

import { InjectedWeb3Subprovider } from '@0xproject/subproviders';
import { ZeroEx } from '0x.js';

// Kovan is a test network
// Please ensure you have Metamask installed
// and it is connected to the Kovan test network
const KOVAN_NETWORK_ID = 42;
const KOVAN_RPC = 'https://kovan.infura.io/SNWrFm1CMX7BfYqvkFXf ';

const styles = {};

const Exchange = () => {
    // Detect if Web3 is found, if not, ask the user to install Metamask
    if (window.web3) {
        // Set up Web3 Provider Engine with a few helper Subproviders from 0x
        const providerEngine = new Web3ProviderEngine();
        providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
        providerEngine.addProvider(new RPCSubprovider({ rpcUrl: KOVAN_RPC }));
        providerEngine.start();

        const web3 = new Web3(providerEngine);
        // Initialize 0x.js with the web3 current provider and provide it the network
        const zeroEx = new ZeroEx(web3.currentProvider, { networkId: KOVAN_NETWORK_ID });
        // Browse the individual files for more handy examples
        return (
            <div style={styles}>
                <Welcome />
                <Account web3={web3} zeroEx={zeroEx} />
                <Faucet zeroEx={zeroEx} />
                <Web3Actions web3={web3} />
            </div>
        );
    } else {
        return <InstallMetamask />;
    }
};

export default Exchange;