import React, { Component } from 'react';
import {Container, Dropdown,Form, Button,Segment,Divider } from 'semantic-ui-react'
import Exchange from '../Exchange';

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
        this.state = {
            tradingCoin: 'BINK',
            exchangeCoin: 'WETH',
            orderType: 'buy'
        }
    }

    tradingCoin = async(e) => {
        this.setState({
            tradingCoin: e.target.innerText
        })
    }

    exchangeCoin = async(e) => {
        this.setState({
            exchangeCoin: e.target.innerText
        })
    }

    toggleBuySell = async() => {
        this.setState((prevState) => {
            return { orderType: (prevState.orderType === 'buy')?'sell':'buy' }
        })
    }

    render() {
        return (
            <Container>
                 <Segment clearing>
                    MARKETPLACE
                    <Button floated='right'>
                    <Dropdown inline 
                        options={this.coins}  
                        defaultValue={this.coins[0].value} 
                        onChange={this.tradingCoin}
                    />
                    </Button>
                </Segment>   
                <label>TRADING TOKEN</label>
                <Dropdown 
                    fluid search selection 
                    options={this.coins} 
                    defaultValue={this.coins[1].value}
                    onChange={this.exchangeCoin}
                />
                <Divider />
                <Button.Group>
                    <Button color='green' onClick={this.toggleBuySell}>BUY</Button>
                    <Button.Or />
                    <Button color='orange' onClick={this.toggleBuySell}>SELL</Button>
                </Button.Group>
                <Form>
                    <Form.Field>
                        <label>AMOUNT {this.state.tradingCoin}</label>
                        <input placeholder='0' type='number'/>
                    </Form.Field>
                    <Form.Field>
                        <label>PRICE {this.state.exchangeCoin}</label>
                        <input placeholder='0' type='number' />
                    </Form.Field>
                    <Form.Field>
                        <label>0.00% FEE</label>
                        <p>0 ZRX</p>
                        <p>$ 0 USD</p>
                    </Form.Field>
                    <Form.Field>
                        <label>TOTAL</label>
                        <p>0 WETH</p>
                        <p>$ 0 USD</p>
                    </Form.Field>
                    {
                        (this.state.orderType === 'buy') ?
                        <Button type='submit' color='green'>PLACE BUY ORDER</Button>
                        :
                        <Button type='submit' color='orange'>PLACE SELL ORDER</Button>
                    }
                    
                </Form>
            </Container>
        );
    }
}

export default Exchange(BuySellToken);