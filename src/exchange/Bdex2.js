import React, { Component } from 'react';
//import 'semantic-ui-css/semantic.min.css';
import { Icon, Image, Grid, Table,  Button, Divider, Tab, Label, Transition, Checkbox, Loader } from 'semantic-ui-react'
import {Input,Form } from 'formsy-semantic-ui-react';
import {addValidationRule} from 'formsy-react';
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import DataTable from '../util/Datatable'
import WrapUnWrapEther from './components/WrapUnWrapEther'
import TradingSteps from './components/bdex2/TradingSteps'
var moment = require('moment')

class App extends Component {
    constructor(props) {
        super(props);
    }
    tradingCoin = 0; 
    exchangeCoin = 0;
    bdexUtil = null;
    state = { 
        activeItem: 'Welcome',
        balances: {
            'WETH': 'NIL',
            'ZRX': 'NIL',
            'BINK': 'NIL',
            'ETH': 'NIL'
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
        activeOrders: [],
        filledOrders:[],
        userActiveOrders:[],
        userFilledOrders:[],
        canSubmit: false,
        lastTradedPrice:0,
        hideOrderForm: false,
        duration:24*60*60,
        showLoading: false
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
            expirationUnixTimestampSec: new BigNumber(Date.now() + this.state.duration), // Valid for up to an hour
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
            this.props.bdexUtil.socketUtil.addOrder({
                "hash": orderHash,
                "fromToken": this.state.tradingCoin,
                "fromTokenValue": this.tradingCoin,
                "toToken": this.state.exchangeCoin,
                "toTokenValue": this.exchangeCoin,
                "signedOrder": signedOrder,
                "orderType": this.state.orderType
            });
            this.props.showMessage('green', 'Your order created successfully!')
            const isOrderValid = await this.props.zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
            console.log('isOrderValid', isOrderValid);
            this.setState({
                hideOrderForm:false
            })
        } catch(e) {
            console.log(e);
            let message = e.message.split(/[\n\r]/);
            this.props.showMessage('red', message[0]) 
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
            this.props.showMessage('green', "Token allowance action successful!");
        } catch(e) {
            console.log(e)
            let message = e.message.split(/[\n\r]/);
            this.props.showMessage('red', message[0]) 
            this.setState({
                hideOrderForm:false
            })
        }
    }
    showOrders = async() => {
        let activeOrders = await this.props.bdexUtil.getActiveOrders();
        let filledOrders = await this.props.bdexUtil.getFilledOrders();
        this.setState({
            activeOrders: activeOrders,
            filledOrders: filledOrders
        })  
    }

    socketListner = () => {
        this.props.bdexUtil.socketUtil.socket.on('neworder', (order) => {
            console.log("NEW ORDER LOGGED", order)
            let activeOrders = this.state.activeOrders;
            activeOrders.push(order)
            console.log(this.state.userActiveOrders)
            if(order.signedOrder.maker === this.props.ownerAddress) {
                let userActiveOrders = this.state.userActiveOrders;
                userActiveOrders.push(order)
                this.setState({
                    userActiveOrders: userActiveOrders 
                })
            }
            this.setState({
                activeOrders: activeOrders 
            }) 
        })
        
        this.props.bdexUtil.socketUtil.socket.on('fillorder', (orderhash) => {
            console.log("fillorder LOGGED")
            let filledOrders = this.state.filledOrders;
            let userFilledOrders = this.state.userFilledOrders;
            let filledOrder;
            let activeOrders = this.state.activeOrders.filter((order) => {
                if(order.hash !== orderhash) {
                    return true
                }
                filledOrder = order
                return false;
            })
            filledOrders.push(filledOrder)
            userFilledOrders.push(filledOrder)
            this.setState({
                activeOrders: activeOrders,
                filledOrders: filledOrders,
                userFilledOrders: userFilledOrders
            }) 
        })

        this.props.bdexUtil.socketUtil.socket.on('cancelorder', (orderhash) => {
            console.log("cancelorder LOGGED")
            let userActiveOrders = this.state.userActiveOrders.filter((order) => {
                if(order.hash !== orderhash) {
                    return true
                }
                return false;
            })
            let activeOrders = this.state.activeOrders.filter((order) => {
                if(order.hash !== orderhash) {
                    return true
                }
                return false;
            })
            this.setState({
                activeOrders: activeOrders,
                userActiveOrders: userActiveOrders
            }) 
        })
    }

    componentDidMount = async() => {
        console.log(this.props);
        let prices = await this.props.bdexUtil.getMarketPrices();
        let userActiveOrders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'active');
        let userFilledOrders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'filled');
        this.setState({
            prices: prices,
            lastTradedPrice:(prices['ZRX'] / prices['WETH']).toFixed(8),
            userActiveOrders: userActiveOrders,
            userFilledOrders: userFilledOrders
        }, () => {
            this.exchangeCoin = this.state.lastTradedPrice
        })

        if ( this.props.ownerAddress ) {
            this.setBalanceAllowance();
        }
        this.showOrders();
        this.socketListner();


        // let myadd = '0x891c53A37d672783eD43E7b1f39ef360F62BA0D6'.toLowerCase();
        // const indexFilterValues = {
        //     maker: myadd,
        // };
        // this.props.zeroEx.exchange.subscribe('LogCancel',indexFilterValues, (e,l)=>{
        //     console.log('here in subscribe');
        //     console.log('err sub',e);
        //     console.log('err sub',l);
        // })
    }

    componentDidUpdate = async(prevProps, prevState) => {
        if ( prevProps.ownerAddress !== this.props.ownerAddress) {
            if ( this.props.ownerAddress ) {
                this.setBalanceAllowance();
                let userActiveOrders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'active');
                let userFilledOrders = await this.props.bdexUtil.getUserOrders(this.props.ownerAddress, 'filled');
                this.setState({
                    userActiveOrders: userActiveOrders,
                    userFilledOrders: userFilledOrders
                })
            }
        }
    }

    setBalanceAllowance = async() => {
        let balances = await this.props.bdexUtil.getBalances(this.props.ownerAddress, this.props.tokenContractAddresses);
        balances['ETH'] = ((await this.props.web3.eth.getBalanceAsync(this.props.ownerAddress))/Math.pow(10, 18))
        .toFixed(8)
        let allowance = await this.props.bdexUtil.getAllowances(this.props.ownerAddress, this.props.tokenContractAddresses);
        this.setState({
            balances: balances,
            allowance: allowance
        })
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

    fillOrder = async(signedOrder, toAmountValue, orderHash) => {
        try{
            this.setState({
                showLoading: true
            })
            console.log('signedOrder',signedOrder)
            console.log('toAmount',toAmountValue)
            const shouldThrowOnInsufficientBalanceOrAllowance = false;
            const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(parseFloat(signedOrder.takerTokenAmount)), this.DECIMALS);
            // const signedOrder = this.convertPortalOrder(signedOrder);
            
            const txHash = await this.props.zeroEx.exchange.fillOrderAsync(
                this.props.bdexUtil.convertPortalOrder(signedOrder),
                fillTakerTokenAmount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                this.props.ownerAddress
            );
            console.log('txHash', txHash);
            const txReceipt = await this.props.zeroEx.awaitTransactionMinedAsync(txHash);
            this.props.bdexUtil.socketUtil.fillOrder(orderHash, txHash);
            this.setState({
                showLoading: false
            })
            this.props.showMessage('green', "Order filled successfully!");
            console.log('FillOrder transaction receipt: ', txReceipt);
        } catch(e) {
            this.setState({
                showLoading: false
            })
            let message = e.message.split(/[\n\r]/);
            this.props.showMessage('red', message[0]) 
            this.setState({
                hideOrderForm:false
            })
            console.log('fillorder error', e);
        }
    }

    flipOrder = () => {
        this.setState({
            hideOrderForm: !this.state.hideOrderForm
        })
    }

    setDuration = (e,data) => {
        this.setState({
            duration: data.value
        })
    }

    render() {
        addValidationRule('isInsufficientBalance', (values, value, others) => {
            return this.state.allowance['WETH'] && (value*others[0] <= others[1]);
        })
        let activeOrders = [];
        let filledOrders = [];
        const { activeItem } = this.state
        const panes = [
            { menuItem: 'Open Orders', 
                render: () => { let userActiveOrders = []; return ( <Tab.Pane inverted attached={false}>
                    {
                        this.state.userActiveOrders.forEach((order,i) => {
                            userActiveOrders.push({
                                    amount: order.fromTokenValue,
                                    price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                {order.toTokenValue}
                                            </Label>,
                                    sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                    action: <Button 
                                            onClick={() => this.props.bdexUtil.cancelOrder(order.signedOrder, order.toTokenValue, order.hash, this.props.showMessage) } 
                                            negative
                                            >
                                                Cancel
                                            </Button>,
                                    popupContent: <div>
                                                    <b>ADDRESS</b>
                                                    <div>{order.signedOrder.maker}</div>
                                                    <b>SELLING</b>
                                                    <div>{`${order.toTokenValue} ${order.toToken}`}</div>
                                                    <b>BUYING</b>
                                                    <div>{`${order.fromTokenValue} ${order.fromToken}`}</div>
                                                    <b>Expires</b>
                                                    <div>{moment(parseInt(order.signedOrder.expirationUnixTimestampSec)).format('MMMM Do YYYY, h:mm:ss a')}</div>
                                                </div>
                                                
                                })
                            })
                    }
                        <DataTable
                            data={userActiveOrders}
                            header
                            mainHeader={`${this.state.tradingCoin}:${this.state.exchangeCoin} ORDER BOOK`}
                            columns={[
                                        {key:"amount", display:"AMOUNT"},
                                        {key:"price", display:"PRICE"},
                                        {key:"sum", display:"SUM IN USD",colSpan:2},
                                        {key:"action"}
                                    ]}
                            pageLimit={4}
                        />
                    </Tab.Pane> 
                )
                }   
            },
            { 
                menuItem: 'Filled Orders', 
                render: () => {   let userFilledOrders = [];  return ( <Tab.Pane inverted attached={false}>
                    {
                        this.state.userFilledOrders.forEach((order,i) => {
                            userFilledOrders.push({
                                    amount: order.fromTokenValue,
                                    price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                {order.toTokenValue}
                                            </Label>,
                                    sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                    action: ((order.txHash) && 
                                            <a target='_blank' href={`https://kovan.etherscan.io/tx/${order.txHash}`}>
                                                <Label color='blue'>VIEW</Label>
                                            </a>
                                            )
                                })
                            })
                    }
                        <DataTable
                            data={userFilledOrders}
                            header
                            mainHeader={`${this.state.tradingCoin}:${this.state.exchangeCoin} ORDER BOOK`}
                            columns={[
                                        {key:"amount", display:"AMOUNT"},
                                        {key:"price", display:"PRICE"},
                                        {key:"sum", display:"SUM IN USD", colSpan:2},
                                        {key:"action"},
                                    ]}
                            pageLimit={4}
                        />
                    </Tab.Pane> 
                    )
                }
            }
        ]
        const errorLabel = <Label color="red" pointing/>
        return (
                <div>
                    <Grid celled='internally'>
                        <Grid.Row>
                            <Grid.Column computer={4} mobile={16}>
                                <Table compact='very' inverted unstackable>
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
                                                    <div><b>{this.state.orderType}</b></div>
                                                    <div>{this.tradingCoin} {this.state.tradingCoin}</div> 
                                                    <small>
                                                        ${(this.tradingCoin*this.state.prices[this.state.tradingCoin]).toFixed(2)}
                                                    </small> 
                                                    <div><b>PRICE</b></div>
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
                                                        color={this.state.duration === 60*60?'green':''}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Day'
                                                        type='button'
                                                        size='mini'
                                                        value={24*60*60}
                                                        color={this.state.duration === 24*60*60?'green':''}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Week'
                                                        type='button'
                                                        size='mini'
                                                        value={7*24*60*60}
                                                        color={this.state.duration === 7*24*60*60?'green':''}
                                                        onClick={this.setDuration}
                                                    />
                                                    <Button
                                                        content='1 Month'
                                                        type='button'
                                                        size='mini'
                                                        value={30*24*60*60}
                                                        color={this.state.duration === 30*24*60*60?'green':''}
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
                                                        validations={`isNumeric,minLength:1`}
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
                            <Grid.Column textAlign="center" verticalAlign="middle" computer={8} mobile={16}>
                                iframe
                            </Grid.Column>


                            {/* ORDER BOOK */}
                            <Grid.Column computer={4} mobile={16}>
                                {
                                    this.state.activeOrders.forEach((order,i) => {
                                        activeOrders.push({
                                            amount: order.fromTokenValue,
                                            price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                        {order.toTokenValue}
                                                    </Label>,
                                            sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                            action: this.state.showLoading? <Loader active inline />:<Button size='mini' 
                                                        onClick={
                                                            () =>this.fillOrder(order.signedOrder, order.toTokenValue, order.hash)
                                                        }
                                                        positive
                                                    >
                                                        Fill
                                                    </Button>,
                                            popupContent: <div>
                                                            <b>ADDRESS</b>
                                                            <div>{order.signedOrder.maker}</div>
                                                            <b>SELLING</b>
                                                            <div>{`${order.toTokenValue} ${order.toToken}`}</div>
                                                            <b>BUYING</b>
                                                            <div>{`${order.fromTokenValue} ${order.fromToken}`}</div>
                                                            <b>Expires</b>
                                                            <div>{moment(parseInt(order.signedOrder.expirationUnixTimestampSec)).format('MMMM Do YYYY, h:mm:ss a')}</div>
                                                        </div>
                                        })
                                    })
                                }
                                <DataTable
                                    data={activeOrders}
                                    header
                                    mainHeader={`${this.state.tradingCoin}:${this.state.exchangeCoin} ORDER BOOK`}
                                    columns={[
                                                {key:"amount", display:"AMOUNT"},
                                                {key:"price", display:"PRICE"},
                                                {key:"sum", display:"SUM IN USD",colSpan:2},
                                                {key:"action"}
                                            ]}
                                    pageLimit={99999}
                                    tableScrollHeight={260}
                                />
                            </Grid.Column>
                        </Grid.Row>

                        {/* Your Balances */}
                        <Grid.Row>
                            <Grid.Column computer={4} mobile={16}>
                                <Table inverted striped unstackable>
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
                            <Grid.Column computer={8} mobile={16}>
                                <Table inverted striped unstackable>
                                    <Table.Body>
                                        <Table.Row>
                                                <Tab as="td" menu={{ secondary: true, pointing: true, inverted: true }} panes={panes} />
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                            <Grid.Column computer={4} mobile={16}>
                                {
                                    this.state.filledOrders.forEach((order,i) => {
                                        filledOrders.push({
                                            amount: order.fromTokenValue,
                                            price: <Label color={(order.orderType === 'buy')?'green':'red'} basic>
                                                        {order.toTokenValue}
                                                    </Label>,
                                            sum:  (order.toTokenValue*this.state.prices['WETH']).toFixed(2),
                                            action: ((order.txHash) && 
                                                    <a target='_blank' href={`https://kovan.etherscan.io/tx/${order.txHash}`}>
                                                        <Label color='blue'>VIEW</Label>
                                                    </a>
                                                    )
                                        })
                                    })
                                }
                                <DataTable
                                    data={filledOrders}
                                    header
                                    mainHeader={`TRADE HISTORY`}
                                    columns={[
                                                {key:"amount", display:"AMOUNT"},
                                                {key:"price", display:"PRICE"},
                                                {key:"sum", display:"SUM IN USD", colSpan:2},
                                                {key:"action"},
                                            ]}
                                    pageLimit={99999}
                                    tableScrollHeight={260}
                                />        
                            </Grid.Column>
                        </Grid.Row>

                    </Grid>
                    {
                        (this.state.balances['ETH'] !== 'NIL') && 
                        <TradingSteps {...this.state} {...this.props} 
                        setBalanceAllowance={this.setBalanceAllowance}
                        takeAllowance = {this.takeAllowance}/>
                    }
                    
                </div>
                
        );
    }
}

export default App;
