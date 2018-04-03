import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
var store = require('store')
var expirePlugin = require('store/plugins/expire')
var axios = require('axios');
var url = require('url');
store.addPlugin(expirePlugin)
class BdexAction {
    constructor(web3, zeroEx) {
        var host = url.parse(window.location.href, true).host;
        if(host === 'localhost:3000') {
            this.baseUrl = 'http://localhost:3001/'
        } else {
            this.baseUrl = 'http://www-qaapi.binkd.com/'
        }
        this.web3 = web3;
        this.zeroEx = zeroEx;
        this.DECIMALS = 18
    }
    saveOrder = (order) => {
        let orders = [];
        if(store.get("orders")) {
            orders = store.get("orders");
        }
        orders.push(order);
        store.set("orders", orders)
        try{
            axios.post(`${this.baseUrl}orders/create`, order, {
                "Access-Control-Allow-Origin" : "*"
            })
            .then((orders) => {
                console.log('savedOrder',orders)
                return true;
            })
            .catch((e) => {
                console.log(e);
                return false;
            })
        } catch(e) {
            console.log(e);
            return;
        }
    }

    getOrders = async(status) => {
        try{
            let responseData = await axios.get(`${this.baseUrl}orders/${status}`);
            let orders = responseData.data.results;
            if(orders) {
                return orders;
            } else {
                return [];
            }
        } catch(e) {
            console.log(e);
            return [];
        }
        
        // let orders =[]
        // if(store.get("orders")) {
        //     orders = store.get("orders");
        // }
        // console.log('all orders',orders);
        // return orders
    }
    isBigEnough(value) {
        return value > 0;
    }

    getActiveOrders = async() => {
        let orders = await this.getOrders('active');
        console.log('all orders', orders)
        let activeOrders = []
        try{
            for(let i in orders) {
                let order = orders[i];
                let response = await this.zeroEx.exchange.getUnavailableTakerAmountAsync(order.hash)
                console.log('resp',response)
                let bal = parseFloat(order.toTokenValue) - (response/Math.pow(10, this.DECIMALS))
                console.log('bal',bal);
                if(bal > 0){
                    activeOrders.push(order)
                }  
            }
            console.log('all orders', orders)
            console.log('active orders', activeOrders)
        }catch(e)  {
            console.log('balerr',e)
        }
        return activeOrders;
    }

    getFilledOrders = async() => {
        try{
            let filledOrders = await this.getOrders('filled');
            return filledOrders
        }catch(e)  {
            console.log('balerr',e)
            return [];
        }
    }

    getBalances = async(ownerAddress, tokenContractAddresses) => {
        console.log(tokenContractAddresses);
        let balances = {}
        for(var key in tokenContractAddresses) {
            let bal = await this.getTokenBalance(ownerAddress, tokenContractAddresses[key])
            balances[key] = bal.toFixed(8);
        }
        console.log(balances);
        return balances;
    }

    getTokenBalance = async(ownerAddress, tokenAddress) => {
        let balance = await this.zeroEx.token.getBalanceAsync(tokenAddress, ownerAddress);
        let tokenBalance = balance/Math.pow(10, this.DECIMALS)
        return tokenBalance;
    }

    getAllowances = async(ownerAddress, tokenContractAddresses) => {
        let allowance = {}
        for(var key in tokenContractAddresses) {
        console.log(allowance);
            allowance[key] = await this.zeroEx.token.getProxyAllowanceAsync(
                tokenContractAddresses[key], 
                ownerAddress
            )
            allowance[key] = allowance[key]/Math.pow(10, this.DECIMALS)
        }
        return allowance
    }

    convertPortalOrder = (signedOrder) => {
        const rawSignedOrder = signedOrder;
        rawSignedOrder.makerFee = new BigNumber(rawSignedOrder.makerFee);
        rawSignedOrder.takerFee = new BigNumber(rawSignedOrder.takerFee);
        rawSignedOrder.makerTokenAmount = new BigNumber(rawSignedOrder.makerTokenAmount);
        rawSignedOrder.takerTokenAmount = new BigNumber(rawSignedOrder.takerTokenAmount);
        rawSignedOrder.expirationUnixTimestampSec = new BigNumber(rawSignedOrder.expirationUnixTimestampSec);
        rawSignedOrder.salt = new BigNumber(rawSignedOrder.salt);
        return rawSignedOrder;
    }

    getMarketPrices = async(coin) => {
        console.log('getting market prices');
        if(store.get('prices')) {
            return store.get('prices');
        } else{
            let response = await axios.get('https://api.coinmarketcap.com/v1/ticker/?limit=0')
            console.log(coin,' price is ',response);
            let prices = {};
            response.data.forEach((coin) => {
                prices[coin.symbol] = coin.price_usd
            })
            store.set('prices', prices, new Date().getTime() + 24*60*60*1000)
            return prices;
        }
    }

    


}

export default BdexAction;
