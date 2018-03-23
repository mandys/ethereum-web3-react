import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
var store = require('store')
var axios = require('axios');

class BdexAction {
    constructor(web3, zeroEx) {
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
        // axios.post('http://localhost:3001/orders/create', order, {
        //     "Access-Control-Allow-Origin" : "*"
        // })
        // .then((orders) => {
        //     console.log('savedOrder',orders)
        //     return true;
        // })
        // .catch((e) => {
        //     console.log(e);
        //     return false;
        // })
    }

    getAllOrders = async() => {
        let orders =[]
        if(store.get("orders")) {
            orders = store.get("orders");
        }
        console.log('all orders',orders);
        return orders
        // axios.get('http://localhost:3001/orders')
        // .then((response) => {
        //     let orders = response.data.results
        //     console.log('orders',orders)
        //     if(orders) {
        //         console.log('filteredOrders',`${this.state.tradingCoin}:${this.state.exchangeCoin}`);
        //         return await getActiveOrders(orders)
        //         console.log('filteredOrders',neworders);
        //     } else {
        //         return [];
        //     }
        // })
        // .catch((e) => {
        //     return false;
        //     console.log(e)
        // })
    }

    getActiveOrders = async() => {
        let orders = await this.getAllOrders();
        let activeOrders = []
        activeOrders = orders.filter(async(order)=>{
            await this.zeroEx.exchange.getUnavailableTakerAmountAsync(order.hash)
            .then(response => {
                let bal = parseFloat(order.toTokenValue) - (response/Math.pow(10, this.DECIMALS))
                console.log('bal',bal);
                if(bal > 0){
                    return true
                }
            }).catch(err => {  
                console.log('balerr',err)
                return false;
            })
        })
        return activeOrders;
    }

    getFilledOrders = async() => {
        let orders = await this.getAllOrders();
        let filledOrders = []
        filledOrders = orders.filter(async(order)=>{
            await this.zeroEx.exchange.getUnavailableTakerAmountAsync(order.hash)
            .then(response => {
                let bal = parseFloat(order.toTokenValue) - (response/Math.pow(10, this.DECIMALS))
                console.log('bal',bal);
                if(bal <= 0){
                    return true
                }
            }).catch(err => {  
                console.log('balerr',err)
                return false;
            })
        })
        return filledOrders;
    }

    getBalances = async(ownerAddress, tokenContractAddresses) => {
        console.log(tokenContractAddresses);
        let balances = {}
        for(var key in tokenContractAddresses) {
            balances[key] = await this.getTokenBalance(ownerAddress, tokenContractAddresses[key])
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

    getMarketPrice = async(coin) => {
        let coinMappings = {
            'WETH': 'ethereum',
            'ZRX': '0x'
        }
        console.log('getting market prices');
        let response = await axios.get(`https://api.coinmarketcap.com/v1/ticker/${coinMappings[coin]}/`)
        console.log(coin,' price is ',response.data[0]);
        return response.data[0].price_usd;
    }


}

export default BdexAction;
