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

}

export default BdexAction;
