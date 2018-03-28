import * as Web3ProviderEngine from 'web3-provider-engine';
import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc';

import { InjectedWeb3Subprovider } from '@0xproject/subproviders';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';

const KOVAN_NETWORK_ID = 42;
// Create a Web3 Provider Engine
const providerEngine = new Web3ProviderEngine();
// Compose our Providers, order matters
// Use the InjectedWeb3Subprovider to wrap the browser extension wallet
// All account based and signing requests will go through the InjectedWeb3Subprovider
//providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
// Use an RPC provider to route all other requests
providerEngine.addProvider(new RPCSubprovider({ rpcUrl: 'http://54.219.243.226:8545/' }));
providerEngine.start();

// Optional, use with 0x.js
const zeroEx = new ZeroEx(providerEngine, { networkId: KOVAN_NETWORK_ID });
// Get all of the accounts through the Web3Wrapper
const makerFee = new BigNumber(0);
const takerFee = new BigNumber(0);
const signedOrder = {
    "maker": "0x54bee119b76bb331bac3f3190ce26f390c12a67b",
    "taker": "0x0000000000000000000000000000000000000000",
    "feeRecipient": "0x0000000000000000000000000000000000000000",
    "exchangeContractAddress": "0x90fe2af704b34e0224bf2299c838e04d4dcf1364",
    "salt": "83777415530642907878321477842275107668027868431172701438030489969943389184636",
    "makerFee": "0",
    "takerFee": "0",
    "expirationUnixTimestampSec": "1522068341434",
    "makerTokenAddress": "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    "takerTokenAddress": "0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570",
    "makerTokenAmount": "1096800000000000",
    "takerTokenAmount": "100000000000000000",
    "ecSignature": {
      "v": 27,
      "r": "0x3ee5c308a6fddd5c52e3ee0023c0ef9e4a0e7543bd729611c72c0db704792947",
      "s": "0x4425f3ae0ab809466d4ac7c39fda837f702dc5d6d0b676d4f0a70477feddcd42"
    }
  }




const convertPortalOrder = (signedOrder) => {
    const rawSignedOrder = signedOrder;
    rawSignedOrder.makerFee = new BigNumber(rawSignedOrder.makerFee);
    rawSignedOrder.takerFee = new BigNumber(rawSignedOrder.takerFee);
    rawSignedOrder.makerTokenAmount = new BigNumber(rawSignedOrder.makerTokenAmount);
    rawSignedOrder.takerTokenAmount = new BigNumber(rawSignedOrder.takerTokenAmount);
    rawSignedOrder.expirationUnixTimestampSec = new BigNumber(rawSignedOrder.expirationUnixTimestampSec);
    rawSignedOrder.salt = new BigNumber(rawSignedOrder.salt);
    return rawSignedOrder;
}
const web3Wrapper = new Web3Wrapper(providerEngine);
(async () => {
    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    console.log(accounts);
    let orderSync = zeroEx.orderStateWatcher.subscribe((a, b) => {
        console.log('a', a);
        console.log('b', b);
    }) 
    let orderWatch = zeroEx.orderStateWatcher.addOrder(convertPortalOrder(signedOrder));
})()
