import React, { Component } from 'react';
//import 'semantic-ui-css/semantic.min.css';
import { Icon, Image, Grid, Table,  Button, Divider, Tab, Label, Transition, Checkbox } from 'semantic-ui-react'
import {Input,Form } from 'formsy-semantic-ui-react';
import {addValidationRule} from 'formsy-react';
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import BdexUtil from '../util/bdex-utils'
import WrapUnWrapEther from './components/WrapUnWrapEther'

class App extends Component {
    constructor(props) {
        super(props);
        console.log(props);
       
    }
    tradingCoin = 0;
    exchangeCoin = 0;
    bdexUtil = null;
    duration = 24*60*60
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
        prices: {
            'WETH': 0
        },
        positive: true,
        negative: false,
        tradingCoin: 'ZRX',
        exchangeCoin: 'WETH',
        orderType: 'buy',
        orders: [],
        canSubmit: false,
        lastTradedPrice:0,
        hideOrderForm: false
    }
    DECIMALS = 18

    setCoins = (e, data) => {
        console.log(data);
        if ( data.name === 'tradingCoin' ) {
            this.tradingCoin = data.value;
        } else if ( data.name === 'exchangeCoin' ) {
            this.exchangeCoin = data.value
        }
    }
    createOrder = async (e) => {
        let order = {
            maker: this.props.ownerAddress,
            taker: ZeroEx.NULL_ADDRESS,
            feeRecipient: ZeroEx.NULL_ADDRESS,
            exchangeContractAddress: this.props.exchangeAddress,
            salt: ZeroEx.generatePseudoRandomSalt(),
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            expirationUnixTimestampSec: new BigNumber(Date.now() + this.duration), // Valid for up to an hour
        };  
        if ( this.state.orderType === 'buy') {
            order.makerTokenAddress  = this.props.tokenContractAddresses[this.state.exchangeCoin]
            order.takerTokenAddress  = this.props.tokenContractAddresses[this.state.tradingCoin]
            order.makerTokenAmount   =  ZeroEx.toBaseUnitAmount(new BigNumber(this.exchangeCoin), this.DECIMALS) // Base 18 decimals
            order.takerTokenAmount   =  ZeroEx.toBaseUnitAmount(new BigNumber(this.tradingCoin), this.DECIMALS) // Base 18 decimals
        } else if ( this.state.orderType === 'sell' ) {
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
        
            console.log('signedOrder', signedOrder);
            await this.bdexUtil.saveOrder({
                "hash": orderHash,
                "fromToken": this.state.tradingCoin,
                "fromTokenValue": this.tradingCoin,
                "toToken": this.state.exchangeCoin,
                "toTokenValue": this.exchangeCoin,
                "signedOrder": signedOrder,
                "orderType": this.state.orderType
            });
            this.showOrders();
            
            const isOrderValid = await this.props.zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
            console.log('isOrderValid', isOrderValid);
            this.setState({
                hideOrderForm:false
            })
        } catch(e) {
            console.log(e); 
            this.setState({
                hideOrderForm:false
            })
        }
    }



    handleBuySellToggle = (e, data) => {
        console.log(data.children)
        if (data.children === 'Buy') {
            this.setState({
                positive: true,
                negative: false,
                orderType: 'buy'
            })
        } else if (data.children === 'Sell') {
            this.setState({
                positive: false,
                negative: true,
                orderType: 'sell'
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
        let orders = await this.bdexUtil.getActiveOrders();
        this.setState({
            orders: orders
        })  
    }
    componentDidMount = async() => {
        console.log('props', this.props)

        /* From exchange, ownerAddress could come as null
            * as Metamask might be locked and then ZeroEx cannot
            * read the address
            */
        this.bdexUtil = new BdexUtil(this.props.web3, this.props.zeroEx);
        let prices = await this.bdexUtil.getMarketPrices();
        console.log("prices",prices)
        this.setState({
            prices: prices,
            lastTradedPrice:(prices['ZRX'] / prices['WETH']).toFixed(8)
        }, () => {
            this.exchangeCoin = this.state.lastTradedPrice
        })

        if ( this.props.ownerAddress ) {
            this.setBalanceAllowance();
        }
        this.showOrders();
    }

    componentDidUpdate = async(prevProps, prevState) => {
        if ( prevProps.ownerAddress !== this.props.ownerAddress) {
            if ( this.props.ownerAddress ) {
                this.setBalanceAllowance();
            }
        }
    }

    setBalanceAllowance = async() => {
        let balances = await this.bdexUtil.getBalances(this.props.ownerAddress, this.props.tokenContractAddresses);
        let allowance = await this.bdexUtil.getAllowances(this.props.ownerAddress, this.props.tokenContractAddresses);
        this.setState({
            balances: balances,
            allowance: allowance
        })
    }

    orderStateChangeCallback = async(err,orderState) => {
        console.log('orderStateChangeCallback err', err)
        console.log('orderStateChangeCallback orderState', orderState)
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

    fillOrder = async(signedOrder, toAmountValue) => {
        console.log('signedOrder',signedOrder)
        console.log('toAmount',toAmountValue)
        const shouldThrowOnInsufficientBalanceOrAllowance = false;
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(parseFloat(signedOrder.takerTokenAmount)), this.DECIMALS);
        // const signedOrder = this.convertPortalOrder(signedOrder);
        const txHash = await this.props.zeroEx.exchange.fillOrderAsync(
            this.bdexUtil.convertPortalOrder(signedOrder),
            fillTakerTokenAmount,
            shouldThrowOnInsufficientBalanceOrAllowance,
            this.props.ownerAddress
        );
        console.log('txHash', txHash);
        console.log('txHash', txHash);
        const txReceipt = await this.props.zeroEx.awaitTransactionMinedAsync(txHash);
        console.log('FillOrder transaction receipt: ', txReceipt);
    }

    flipOrder = () => {
        this.setState({
            hideOrderForm: !this.state.hideOrderForm
        })
    }

    setDuration = (e,data) => {
        this.duration = data.value
    }

    render() {
        addValidationRule('isInsufficientBalance', function (values, value, others) {
            console.log('in validation');
            return value*others[0] <= others[1];
        })
        addValidationRule('isInsufficientBalanceExchange', function (values, value, others) {
            console.log('in validation');
            return value*others[0] <= others[1];
        })
        const { activeItem } = this.state
        const panes = [
            { menuItem: 'Open Orders', render: () => <Tab.Pane inverted padded="very" attached={false}>You have no open orders for this market.</Tab.Pane> },
            { menuItem: 'Filled Orders', render: () => <Tab.Pane inverted padded="very" attached={false}>You have no filled orders for this market.</Tab.Pane> },
        ]
        const errorLabel = <Label color="red" pointing/>
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
                                            {this.state.prices['WETH'] === 0 ? 
                                                ( 
                                                    <Icon name="spinner" /> 
                                                ) : 
                                                (
                                                    this.state.lastTradedPrice
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
                                                <Form size="small" 
                                                    onSubmit={this.createOrder} 
                                                    onValid={this.enableButton} 
                                                    onInvalid={this.disableButton}
                                                >
                                                <Transition.Group animation='horizontal flip' duration='1000'>
                                                { (this.state.hideOrderForm) && <div>
                                                    <h5>{this.state.orderType}</h5>
                                                    <div>{this.tradingCoin} {this.state.tradingCoin}</div> 
                                                    <small>
                                                        ${(this.tradingCoin*this.state.prices[this.state.tradingCoin]).toFixed(2)}
                                                    </small> 
                                                    <h5>PRICE</h5>
                                                    <div>{this.exchangeCoin} {this.state.exchangeCoin}</div> 
                                                    <small>
                                                        ${(this.exchangeCoin*this.state.prices[this.state.exchangeCoin]).toFixed(2)}
                                                    </small>
                                                    <h5>Keep the order public</h5>
                                                    <p>
                                                    <Button
                                                        content='1 Hour'
                                                        type='button'
                                                        size='mini'
                                                        value={60*60}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Day'
                                                        type='button'
                                                        size='mini'
                                                        value={24*60*60}
                                                        checked={true}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Week'
                                                        type='button'
                                                        size='mini'
                                                        value={7*24*60*60}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Month'
                                                        type='button'
                                                        size='mini'
                                                        value={30*24*60*60}
                                                        onClick={this.setDuration}
                                                    />
                                                    </p>
                                                    <Button.Group widths='2'>
                                                        <Button content='CANCEL' onClick={this.flipOrder} type='button'/>
                                                        <Button color='blue' content='CONFIRM' type='submit'/>
                                                    </Button.Group>                                                   
                                                    </div> 
                                                }
                                                </Transition.Group>
                                                <Transition.Group animation='horizontal flip' duration='1000'>
                                                { (this.state.hideOrderForm === false) && <div>
                                                    <span>Amount</span>
                                                    <Input
                                                        fluid
                                                        labelPosition='right'
                                                        placeholder='0'
                                                        name='tradingCoin'
                                                        onChange={this.setCoins}
                                                        validations={`isNumeric,minLength:1,isInsufficientBalance:[${this.exchangeCoin},${this.state.balances['WETH']}]`}
                                                        instantValidation required 
                                                        validationErrors={{ isNumeric: 'Numeric...', minLength: 'Required 1', isInsufficientBalance: 'Insufficient Balance' }}
                                                        errorLabel = {errorLabel}
                                                    >                                                    
                                                        <input />
                                                        <Label>ZRX</Label>
                                                    </Input>
                                                    <Divider hidden />
                                                    <span>Price</span>
                                                    <Input
                                                        fluid
                                                        labelPosition='right'
                                                        placeholder='0'
                                                        name='exchangeCoin'
                                                        onChange={this.setCoins}
                                                        validations={`isNumeric,minLength:1,isInsufficientBalanceExchange:[${this.tradingCoin},${this.state.balances['WETH']}]`}
                                                        instantValidation required
                                                        value={this.state.lastTradedPrice}
                                                        validationErrors={{ isNumeric: 'Numeric...', minLength: 'Required 1', isInsufficientBalanceExchange: 'Insufficient Balance' }}
                                                    >
                                                        <input />
                                                        <Label>WETH</Label>
                                                    </Input>
                                                    <Divider />
                                                    {
                                                        this.state.orderType === 'buy' ? (
                                                            <Button positive fluid type='button' 
                                                                size="medium" disabled={!this.state.canSubmit}
                                                                onClick={this.flipOrder} 
                                                            >PLACE BUY ORDER</Button>
                                                        ) : (
                                                            <Button negative fluid type='button' 
                                                                size="medium" disabled={!this.state.canSubmit} 
                                                                onClick={this.flipOrder}
                                                            >PLACE SELL ORDER</Button>
                                                        )
                                                    }
                                                </div> }
                                                </Transition.Group>
                                                    
                                                </Form>                         
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
                                            <Table.HeaderCell colSpan="4">ZRX:WETH ORDER BOOK</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell width="4">AMOUNT</Table.Cell>
                                            <Table.Cell textAlign="right">PRICE</Table.Cell>
                                            <Table.Cell textAlign="right">SUM IN USD</Table.Cell>
                                        </Table.Row>
                                        {
                                            this.state.orders.map((order,i) => {
                                                let rowColor = (order.orderType === 'buy')?'green':'red'
                                                return (
                                                    <Table.Row key={i}>
                                                        <Table.Cell>{order.fromTokenValue}</Table.Cell>
                                                        <Table.Cell textAlign="right">
                                                            <Label color={rowColor}>{order.toTokenValue}</Label>
                                                        </Table.Cell>
                                                        <Table.Cell textAlign="right">
                                                            {(order.toTokenValue*this.state.prices['WETH']).toFixed(2)}
                                                        </Table.Cell>
                                                        <Table.Cell textAlign="right">
                                                            <Button 
                                                                onClick={() => this.fillOrder(order.signedOrder, order.toTokenValue) } 
                                                                positive
                                                            >Fill</Button>
                                                        </Table.Cell>
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
                                            <Table.Cell textAlign="right">{this.state.balances.ZRX === 'NIL' ? ( 
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
                                            <Table.Cell width="4">WETH<br />Wrapped Ether 
                                                <WrapUnWrapEther 
                                                    from="ETH" 
                                                    to="WETH" 
                                                    {...this.props} 
                                                    setBalanceAllowance={this.setBalanceAllowance}
                                                />
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">{this.state.balances.WETH === 'NIL' ? ( 
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
