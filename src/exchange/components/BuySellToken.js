import React, { Component } from 'react';
import {Container, Dropdown,Form, Button,Segment,Divider,Grid,Label } from 'semantic-ui-react'
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import Exchange from '../Exchange';
import OrderBook from './OrderBook';
var store = require('store')

class BuySellToken extends Component {
    constructor(props) {
        super(props);
        this.coins = [
            {
                text: 'BINK',
                value: 'BINK',
                image: { avatar: true, src: '/src/icons/bink.png' },
            },
            {
                text: 'WETH',
                value: 'WETH',
                image: { avatar: true, src: '/src/icons/weth.png' },
            },
            {
                text: 'ZRX',
                value: 'ZRX',
                image: { avatar: true, src: '/src/icons/zrx.png' },
            }
        ]
        this.marketOptions = [
            {
                text: 'BUY',
                value: 'buy',
            },
            {
                text: 'SELL',
                value: 'sell',
            }
        ]
        this.DECIMALS = 18;
        this.state = {
            tradingCoin: 'BINK',
            exchangeCoin: 'WETH',
            orderType: 'buy',
            tradingBalance:0
        }
    }

    componentDidMount = async() => {
        const balance = await this.getTokenBalance(this.props.tokenContractAddresses[this.state.tradingCoin]);
        this.setState({
            tradingBalance: balance
        })
    }

    setTradingExchangeCoin = async(e) => {
        const coins = e.target.innerText.split(" -> ");
        const balance = await this.getTokenBalance(this.props.tokenContractAddresses[coins[1]]);
        this.setState({
            tradingCoin: coins[0],
            tradingBalance: balance,
            exchangeCoin: coins[1]
        })
    }

    exchangeCoin = async(e) => {
        this.setState({
            exchangeCoin: e.target.innerText
        })
    }

    toggleBuySell = async(e) => {
        console.log('here')
        this.setState({
             orderType: e.target.innerText.toLowerCase()
        })
    }

    getTokenBalance = async(tokenAddress) => {
        var balance = await this.props.zeroEx.token.getBalanceAsync(tokenAddress, this.props.ownerAddress);
        var tokenBalance = balance/Math.pow(10, this.DECIMALS)
        return tokenBalance;
    }

    createOrder = async () => {
        const order = {
            maker: this.props.ownerAddress,
            taker: ZeroEx.NULL_ADDRESS,
            feeRecipient: ZeroEx.NULL_ADDRESS,
            makerTokenAddress: this.props.tokenContractAddresses[this.state.exchangeCoin],
            takerTokenAddress: this.props.tokenContractAddresses[this.state.tradingCoin],
            exchangeContractAddress: this.props.exchangeAddress,
            salt: ZeroEx.generatePseudoRandomSalt(),
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(this.refs.exchangeCoin.value), this.DECIMALS), // Base 18 decimals
            takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(this.refs.tradingCoin.value), this.DECIMALS), // Base 18 decimals
            expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
        };    
        const orderHash = ZeroEx.getOrderHashHex(order);
        console.log('orderHash', orderHash);
        let orders = {};
        if(store.get("orders")) {
            orders = store.get("orders");
        }

        if(typeof orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] === 'undefined') {
            orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] = [];
        }
        const newOrder = {
            hash: orderHash,
            fromToken: this.refs.tradingCoin.value,
            toToken: this.refs.exchangeCoin.value
        }
        
        const shouldAddPersonalMessagePrefix = true;
        let ecSignature = '';
        try {
            ecSignature = await this.props.zeroEx.signOrderHashAsync(orderHash, this.props.ownerAddress, shouldAddPersonalMessagePrefix);
            console.log('ecSignature', ecSignature);
            let orders = {};
            if(store.get("orders")) {
                orders = store.get("orders");
            }

            if(typeof orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] === 'undefined') {
                orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`] = [];
            }
            const newOrder = {
                hash: orderHash,
                fromToken: this.refs.tradingCoin.value,
                toToken: this.refs.exchangeCoin.value
            }
            orders[`${this.state.tradingCoin}:${this.state.exchangeCoin}`].push(newOrder);
            store.set("orders", orders)
        } catch(e) {
            console.log(e);
        }
        
        // Append signature to order
        let signedOrder = {
            ...order,
            ecSignature,
        };
        console.log('signedOrder', signedOrder);
        try {
            const isOrderValid = await this.props.zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
            console.log('isOrderValid', isOrderValid);
        } catch(e) {
            console.log(e);
        }
    }

    render() {
        return (
            <Container>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={6}>
                            <Segment>
                                MARKETPLACE
                                <Divider />
                                <Form> 
                                    <Form.Field>
                                        <label>CHOOSE A MARKETPLACE</label>
                                        <Button.Group>
                                            <Button primary onClick={this.setTradingExchangeCoin}>BINK -> WETH</Button>
                                            <Button.Or />
                                            <Button secondary onClick={this.setTradingExchangeCoin}>ZRX -> WETH</Button>
                                        </Button.Group>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>I WANT TO </label>
                                        <Dropdown fluid selection
                                            options={this.marketOptions}  
                                            defaultValue={this.marketOptions[0].value} 
                                            onChange={this.toggleBuySell}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>HOW MANY <Label color='blue' basic>{this.state.tradingCoin}</Label> YOU WANT TO BUY</label>
                                        <input placeholder='0' type='text' ref='tradingCoin'/>
                                        <label>Balace {this.state.tradingBalance}</label>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>EXCHANGE PRICE OF <Label color='yellow' basic>{this.state.exchangeCoin}</Label></label>
                                        <input placeholder='0' type='text' ref='exchangeCoin'/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>FEE</label>
                                        ABSOLUTELY FREE!!
                                    </Form.Field>
                                    {/* <Form.Field>
                                        <label>0.00% FEE</label>
                                        <p>0 ZRX</p>
                                        <p>$ 0 USD</p>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>TOTAL</label>
                                        <p>0 WETH</p>
                                        <p>$ 0 USD</p>
                                    </Form.Field> */}
                                    {
                                        (this.state.orderType === 'buy') ?
                                        <Button type='submit' color='green' onClick={this.createOrder}>PLACE BUY ORDER</Button>
                                        :
                                        <Button type='submit' color='orange'>PLACE SELL ORDER</Button>
                                    }
                                </Form>
                            </Segment>  
                        </Grid.Column>
                        <Grid.Column width={10}>
                            <OrderBook from={this.state.tradingCoin} to={this.state.exchangeCoin}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

export default Exchange(BuySellToken);