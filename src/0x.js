var ZeroEx = require('0x.js').ZeroEx;
var ZeroExConfig = require('0x.js').ZeroExConfig;
var BigNumber = require('bignumber.js').BigNumber;
//var HDWalletProvider = require("truffle-hdwallet-provider");
//var mnemonic = "apple banana orange ..."; // i generated this with metaMask
var WalletProvider = require("truffle-wallet-provider");

var pkey_str = require('fs').readFileSync('key').toString();
var prkey_buff = new Buffer(pkey_str, 'hex')
var wallet = require('ethereumjs-wallet').fromPrivateKey(prkey_buff)



var provider = new WalletProvider(wallet, "http://54.219.243.226:8545/")

//var provider = new WalletProvider(wallet, "https://kovan.infura.io/SNWrFm1CMX7BfYqvkFXf")

const zeroExConfig = {
    networkId: 42
};

const zeroEx = new ZeroEx(provider, zeroExConfig);

const signedOrder = 
{
  "maker": "0x54bee119b76bb331bac3f3190ce26f390c12a67b",
  "taker": "0x0000000000000000000000000000000000000000",
  "feeRecipient": "0x0000000000000000000000000000000000000000",
  "exchangeContractAddress": "0x90fe2af704b34e0224bf2299c838e04d4dcf1364",
  "salt": "68261579365160934025789227609896289385826682136121248482272383884449704611796",
  "makerFee": "0",
  "takerFee": "0",
  "expirationUnixTimestampSec": "1522135753721",
  "makerTokenAddress": "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
  "takerTokenAddress": "0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570",
  "makerTokenAmount": "1270130000000000",
  "takerTokenAmount": "500000000000000000",
  "ecSignature": {
    "v": 27,
    "r": "0x6fa1410e2fa797752fed1b9b41ec06de926d0759ea0787f099e8854288ee7328",
    "s": "0x26b6041604cb5da6cc577450ad61ba02cc4511836bc3aea00849f14cf6daa71b"
  }
}

  const convertPortalOrder = (signedOrder) => {
    const rawSignedOrder = signedOrder;
    rawSignedOrder.makerFee = new BigNumber(rawSignedOrder.makerFee);
    rawSignedOrder.takerFee = new BigNumber(rawSignedOrder.takerFee);
    rawSignedOrder.makerTokenAmount = new BigNumber(rawSignedOrder.makerTokenAmount);
    rawSignedOrder.takerTokenAmount = new BigNumber(rawSignedOrder.takerTokenAmount);
    rawSignedOrder.expirationUnixTimestampSec = new BigNumber(rawSignedOrder.expirationUnixTimestampSec);
    rawSignedOrder.salt = rawSignedOrder.salt;
    return rawSignedOrder;
}
console.log(convertPortalOrder(signedOrder));
var EXITCONDITION = true;
function wait () {
    console.log('wait')
    if (!EXITCONDITION)
         setTimeout(wait, 1000);
 };
 
myCallBack = (a) => {
    console.log('myCallBack')
    console.log(a)
}
(async () => {
    const accounts = await zeroEx.getAvailableAddressesAsync();
    console.log(accounts);
    
    let orderSync = zeroEx.orderStateWatcher.subscribe(myCallBack) 
    let orderWatch = zeroEx.orderStateWatcher.addOrder(convertPortalOrder(signedOrder));
    
})().catch((e) => {
    console.log(e)
})
wait();