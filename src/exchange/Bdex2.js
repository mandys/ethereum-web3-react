import React, { Component } from 'react';
import Exchange from './Exchange'
//import 'semantic-ui-css/semantic.min.css';
import { Container, Segment, Menu, Icon, Image, Grid, Table,  Button, Divider, Tab,Label } from 'semantic-ui-react'
import {Form, Input } from 'formsy-semantic-ui-react';
import Formsy from 'formsy-react';
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
var store = require('store')
var axios = require('axios');

class App extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
    tradingCoin = '';
    exchangeCoin = ''
    state = { 
        activeItem: 'Welcome',
        balances: {
            'WETH': 'NIL',
            'ZRX': 'NIL',
            'BINK': 'NIL'
        },
        allowance: {
            'WETH': 0,
            'ZRX': 0,
            'BINK': 0
        },
        positive: true,
        negative: false,
        tradingCoin: 'ZRX',
        exchangeCoin: 'WETH',
        orderType: 'buy',
        current0xPrice: 0,
        currentWETHPrice: 0,
        orders: [],
        canSubmit: false
    }
    DECIMALS = 18
    getBalances = async() => {
        console.log(this.props.tokenContractAddresses);
        let balances = {}
        for(var key in this.props.tokenContractAddresses) {
            balances[key] = await this.getTokenBalance(this.props.tokenContractAddresses[key])
        }
        console.log(balances);
        this.setState({
            balances:balances
        })
    }
    getTokenBalance = async(tokenAddress) => {
        let balance = await this.props.zeroEx.token.getBalanceAsync(tokenAddress, this.props.ownerAddress);
        let tokenBalance = balance/Math.pow(10, this.DECIMALS)
        return tokenBalance;
    }
    getAllowances = async() => {
        console.log(this.props.tokenContractAddresses);
        let allowance = {}
        for(var key in this.props.tokenContractAddresses) {
        console.log(allowance);
            allowance[key] = await this.props.zeroEx.token.getProxyAllowanceAsync(
                this.props.tokenContractAddresses[key], 
                this.props.ownerAddress
            )
            allowance[key] = allowance[key]/Math.pow(10, this.DECIMALS)
        }
        console.log('alowance',allowance);
        this.setState({
            allowance:allowance
        })
        
    }
    setCoins = (e, data) => {
        console.log(data);
        if ( data.name === 'tradingCoin' ) {
            this.tradingCoin = data.value;
        } else if ( data.name === 'exchangeCoin' ) {
            this.exchangeCoin = data.value
        }
    }
    createOrder = async (e, data) => {
        let order = {
            maker: this.props.ownerAddress,
            taker: ZeroEx.NULL_ADDRESS,
            feeRecipient: ZeroEx.NULL_ADDRESS,
            exchangeContractAddress: this.props.exchangeAddress,
            salt: ZeroEx.generatePseudoRandomSalt(),
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
        };  
        if ( this.state.orderType == 'buy') {
            order.makerTokenAddress  = this.props.tokenContractAddresses[this.state.exchangeCoin]
            order.takerTokenAddress  = this.props.tokenContractAddresses[this.state.tradingCoin]
            order.makerTokenAmount   =  ZeroEx.toBaseUnitAmount(new BigNumber(this.exchangeCoin), this.DECIMALS) // Base 18 decimals
            order.takerTokenAmount   =  ZeroEx.toBaseUnitAmount(new BigNumber(this.tradingCoin), this.DECIMALS) // Base 18 decimals
        } else if ( this.state.orderType == 'sell' ) {
            order.makerTokenAddress  =  this.props.tokenContractAddresses[this.state.tradingCoin]
            order.takerTokenAddress  =  this.props.tokenContractAddresses[this.state.exchangeCoin]
            order.makerTokenAmount   =  ZeroEx.toBaseUnitAmount(new BigNumber(this.tradingCoin), this.DECIMALS) // Base 18 decimals
            order.takerTokenAmount   = ZeroEx.toBaseUnitAmount(new BigNumber(this.exchangeCoin), this.DECIMALS) // Base 18 decimals
        }
  
        const orderHash = ZeroEx.getOrderHashHex(order);
        console.log('orderHash', orderHash);
        let signedOrder = '';
        const shouldAddPersonalMessagePrefix = true;
        let ecSignature = '';
        try {
            ecSignature = await this.props.zeroEx.signOrderHashAsync(orderHash, this.props.ownerAddress, shouldAddPersonalMessagePrefix);
            console.log('ecSignature', ecSignature);
            // Append signature to order
            signedOrder = {
                ...order,
                ecSignature,
            };
            let orders = {};
            if(store.get("orders")) {
                orders = store.get("orders");
            }

            if(typeof orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] === 'undefined') {
                orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] = [];
            }
            orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`].push({
                hash: orderHash,
                fromToken: this.tradingCoin,
                toToken: this.exchangeCoin,
                signedOrder: signedOrder,
                orderType:this.state.orderType
            });
            axios.post('http://localhost:3001/orders/create',signedOrder, {
                "Access-Control-Allow-Origin" : "*"
           })
            .then((orders) => {
                console.log('savedOrder',orders)
            })
            .catch((e) => {
                console.log(e)
            })
            store.set("orders", orders)
        } catch(e) {
            console.log(e);
        }
        
        
        console.log('signedOrder', signedOrder);
        try {
            const isOrderValid = await this.props.zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
            console.log('isOrderValid', isOrderValid);
        } catch(e) {
            console.log(e);
        }
    }
    handleBuySellToggle = (e, data) => {
        console.log(data.children)
        if (data.children == 'Buy') {
            this.setState({
                positive: true,
                negative: false,
                orderType: 'buy'
            })
        } else if (data.children == 'Sell') {
            this.setState({
                positive: false,
                negative: true,
                orderType: 'sell'
            })
        }
    }
    getMarketPrices = (coin_1, coin_2) => {
        console.log('getting market prices...');
        /* check for only one price in store as other will automatically be there */
        const current0xPrice = store.get('current0xPrice');
        const currentWETHPrice = store.get('currentWETHPrice')
        console.log('current0xPrice', current0xPrice);
        console.log('currentWETHPrice', currentWETHPrice);
        if ( current0xPrice ) {
            this.setState({
                current0xPrice: current0xPrice
            })
            this.setState({
                currentWETHPrice: currentWETHPrice
            })
        } else {
            axios.get('https://api.coinmarketcap.com/v1/ticker/0x/')
            .then((response) => {
                console.log(response.data[0]);
                store.set('current0xPrice', response.data[0].price_usd)
                this.setState({
                    current0xPrice: response.data[0].price_usd
                })
            })
            .catch((e) => {
                console.log(e)
            })
        axios.get('https://api.coinmarketcap.com/v1/ticker/ethereum/')
            .then((response) => {
                console.log(response.data[0]);
                store.set('currentWETHPrice', response.data[0].price_usd)
                this.setState({
                    currentWETHPrice: response.data[0].price_usd
                })
            })
            .catch((e) => {
                console.log(e)
            })   
        }
    }
    takeAllowance = async(e, data) => {
        let token = data.name
        console.log('inside getAllowanceFromMaker');
        console.log(this.props.tokenContractAddresses[token]);
        try {
            const setMakerAllowTxHash = await this.props.zeroEx.token.setUnlimitedProxyAllowanceAsync(this.props.tokenContractAddresses[token], this.props.ownerAddress);
            console.log('setMakerAllowTxHash', setMakerAllowTxHash);
            await this.props.zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash);

            this.setState((prevState) => {
                prevState.allowance[`${token}`] = 1
                return prevState
            })
        } catch(e) {
            console.log(e)
        }
    }
    showOrders = async() => {
       
        // orders = store.get("orders");
        axios.get('http://localhost:3001/orders')
        .then((response) => {
            let orders = response.data.results
            console.log('orders',orders)
            if(orders) {
                console.log('filteredOrders',`${this.state.tradingCoin}:${this.state.exchangeCoin}`);
                let neworders = []
                orders.map((order)=>{
                    this.props.zeroEx.exchange.getUnavailableTakerAmountAsync(order.hash)
                        .then(response => {
                            let bal = parseFloat(order.toToken) - (response/Math.pow(10, this.DECIMALS))
                            console.log('orderstatus',bal);
                            if(bal > 0){
                                neworders.push(order)
                                this.setState({
                                    orders: neworders
                                })
                            }
                        }) .catch(err => {
                            console.log('orderstatus',err)
                            return false;
                        })
                }) 
                console.log('filteredOrders',neworders);
            } else {
                this.setState({
                    orders: []
                })
            }
        })
        .catch((e) => {
            console.log(e)
        })
        
    }
    componentDidMount = () => {
        /* From exchange, ownerAddress could come as null
         * as Metamask might be locked and then ZeroEx cannot
         * read the address
         */
        if ( this.props.ownerAddress ) {
            this.getBalances();
            this.getAllowances();
        }
        this.getMarketPrices('ZRX', 'WETH');
        this.showOrders();
    }
    handleItemClick = (e, {name}) => {
        console.log(name)
        this.setState({
            activeItem: name
        })
    }

    disableButton = () => {
        this.setState({ canSubmit: false });
    }
    
    enableButton = () => {
        this.setState({ canSubmit: true });
    }

    render() {
        const { activeItem } = this.state
        const panes = [
            { menuItem: 'Open Orders', render: () => <Tab.Pane inverted padded="very" attached={false}>You have no open orders for this market.</Tab.Pane> },
            { menuItem: 'Filled Orders', render: () => <Tab.Pane inverted padded="very" attached={false}>You have no filled orders for this market.</Tab.Pane> },
        ]
        return (
                <div>
                    <Grid celled='internally'>
                        <Grid.Row>
                            <Grid.Column width={4}>
                                <Table compact='very' inverted>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell width="2"><Image src="https://assets.paradex.io/icons/zrx.svg" size="mini" /></Table.Cell>
                                            <Table.Cell textAlign="left">ZRX / WETH</Table.Cell>
                                            <Table.Cell textAlign="right">
                                            {this.state.currentWETHPrice === 0 ? 
                                                ( 
                                                    <Icon name="spinner" /> 
                                                ) : 
                                                (
                                                    (this.state.current0xPrice / this.state.currentWETHPrice).toFixed(8)
                                                )
                                            }
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>

                                { /* PLACE AN ORDER */}
                                <Table inverted>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>
                                                Place Order
                                                <Button.Group size="mini" floated="right">
                                                    <Button onClick={this.handleBuySellToggle} positive={this.state.positive}>Buy</Button>
                                                    <Button.Or />
                                                    <Button onClick={this.handleBuySellToggle} negative={this.state.negative}>Sell</Button>
                                                </Button.Group>
                                                </Table.HeaderCell>

                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>
                                                <Formsy size="small" inverted onSubmit={this.createOrder} onValid={this.enableButton} onInvalid={this.disableButton}>
                                                    <span>Amount</span>
                                                    <Input
                                                        fluid
                                                        label={{ basic: true, content: 'ZRX' }}
                                                        labelPosition='right'
                                                        placeholder='0'
                                                        name='tradingCoin'
                                                        onChange={this.setCoins}
                                                        validations="isNumeric,minLength:1"
                                                        instantValidation required 
                                                    />
                                                    <Divider hidden />
                                                    <span>Price</span>
                                                    <Input
                                                        fluid
                                                        label={{ basic: true, content: 'WETH' }}
                                                        labelPosition='right'
                                                        placeholder='0'
                                                        name='exchangeCoin'
                                                        onChange={this.setCoins}
                                                        validations="isNumeric,minLength:1"
                                                        instantValidation required
                                                    />
                                                    <Divider />
                                                    {
                                                        this.state.orderType === 'buy' ? (
                                                            <Button positive fluid type='submit' size="medium" disabled={!this.state.canSubmit}>Place Buy Order</Button>
                                                        ) : (
                                                            <Button negative fluid type='submit' size="medium" disabled={!this.state.canSubmit}>Place Sell Order</Button>
                                                        )
                                                    }
                                                </Formsy>                                            
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>                                
                            </Grid.Column>
                            <Grid.Column textAlign="center" verticalAlign="middle" width={8}>
                                iframe
                            </Grid.Column>


                            {/* ORDER BOOK */}
                            <Grid.Column width={4}>
                                <Table inverted striped>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan="3">ZRX:WETH ORDER BOOK</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell width="4">Amount ZRX</Table.Cell>
                                            <Table.Cell textAlign="right">Price</Table.Cell>
                                            <Table.Cell textAlign="right">Sum In USD</Table.Cell>
                                        </Table.Row>
                                        {
                                            this.state.orders.map((order,i) => {
                                                let rowColor = (order.orderType === 'buy')?'green':'red'
                                                return (
                                                    <Table.Row key={i}>
                                                        <Table.Cell>{order.fromToken}</Table.Cell>
                                                        <Table.Cell textAlign="right" >
                                                            <Label color={rowColor}>{order.toToken}</Label>
                                                        </Table.Cell>
                                                        <Table.Cell textAlign="right">{(order.toToken*this.state.currentWETHPrice).toFixed}</Table.Cell>
                                                        {/* <Table.Cell>
                                                            <p>
                                                                <Button onClick={() => this.fillOrder(order.signedOrder, order.toToken) }>Fill Order</Button>
                                                            </p>
                                                            <p>
                                                                <Button onClick={() => this.cancelOrder(order.signedOrder, order.toToken) }>Cancel Order</Button>
                                                            </p>
                                                        </Table.Cell> */}
                                                    </Table.Row>
                                                )
                                            })
                                        }

                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                        </Grid.Row>

                        {/* Your Balances */}
                        <Grid.Row>
                            <Grid.Column width={4}>
                                <Table inverted striped>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan="3">Your Balances</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell width="4">Token</Table.Cell>
                                            <Table.Cell textAlign="right">Available Balance</Table.Cell>
                                            <Table.Cell textAlign="right">Unlocked</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell width="4">ZRX<br />0x</Table.Cell>
                                            <Table.Cell textAlign="right">{this.state.balances.ZRX == 'NIL' ? ( 
                                                <div><Icon name="spinner" /> Fetching Balanace</div> 
                                            ): this.state.balances.ZRX}</Table.Cell>
                                            <Table.Cell textAlign="right">
                                                {
                                                    this.state.allowance.ZRX !== 0 ? <Icon name="unlock" /> : 
                                                    (
                                                        <Button name="ZRX" icon onClick={this.takeAllowance}><Icon name="lock" /></Button>
                                                        
                                                    )
                                                }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell width="4">WETH<br />Wrapped Ether</Table.Cell>
                                            <Table.Cell textAlign="right">{this.state.balances.WETH == 'NIL' ? ( 
                                                <div><Icon name="spinner" /> Fetching Balanace</div> 
                                            ): this.state.balances.WETH}</Table.Cell>
                                            <Table.Cell textAlign="right">
                                                {
                                                    this.state.allowance.WETH !== 0 ? <Icon name="unlock" /> : 
                                                    (
                                                        <Button name="WETH" icon onClick={this.takeAllowance}><Icon name="lock" /></Button>
                                                    )
                                                }
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Table inverted striped>
                                    <Table.Body>
                                        <Table.Row>
                                                <Tab as="td" menu={{ secondary: true, pointing: true, inverted: true }} panes={panes} />
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                            <Grid.Column width={4}>
                                <Table inverted striped>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan="3">TRADE HISTORY</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell width="4">Amount ZRX</Table.Cell>
                                            <Table.Cell textAlign="right">Price</Table.Cell>
                                            <Table.Cell textAlign="right">Time</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell width="4">8.255715</Table.Cell>
                                            <Table.Cell textAlign="right">0.0008479</Table.Cell>
                                            <Table.Cell textAlign="right">03/19 09:27</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell width="4">10.00000</Table.Cell>
                                            <Table.Cell textAlign="right">0.0007931</Table.Cell>
                                            <Table.Cell textAlign="right">03/19 09:26</Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                        </Grid.Row>

                    </Grid>
                </div>
        );
    }
}

export default App;
