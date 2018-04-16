import React, {Component} from 'react'
import { Step, Modal, Grid, Segment, Button, Icon } from 'semantic-ui-react'
import WrapUnWrapEther from '../WrapUnWrapEther'

class TradingSteps extends Component { 
    constructor(props) {
        super(props)
        this.state = {
            open:true,
            complete: {
                eth: false,
                weth: false,
                allowance: false,
            },
            active: {
                eth: true,
                weth: false,
                allowance: false
            }
        }
    }
    componentWillReceiveProps(newProps) {
        console.log(newProps.balances)
        if(newProps.balances['ETH'] > 0) {
            this.setState({
                complete: {
                    eth: true,
                    weth: false,
                    allowance: false,
                },
                active: {
                    eth: false,
                    weth: true,
                    allowance: false
                }
            })

            if(newProps.balances['WETH'] > 0) {
                this.setState({
                    complete: {
                        eth: true,
                        weth: true,
                        allowance: false,
                    }, 
                    active: {
                        eth: false,
                        weth: true,
                        allowance: false
                    }
                })

                if(newProps.allowance[this.props.exchangeCoin] > 0 && newProps.allowance[this.props.tradingCoin] > 0) {
                    this.setState({
                        open: false
                    })
                } else {
                    this.setState({
                    complete: {
                        eth: true,
                        weth: true,
                        allowance: false,
                    }, 
                    active: {
                        eth: false,
                        weth: true,
                        allowance: false
                    }
                })
                }
            }
        }
    }
    render() {
        return (
            <div>
        <Modal  open={this.state.open} closeOnDimmerClick={false}>
            <Modal.Header>Please follow these steps to get started</Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                <div>
                    <Step.Group ordered unstackable attached>
                        <Step  completed={this.state.complete.eth}  active={this.state.active.eth}>
                            <Step.Content>
                                <p></p>
                                <Step.Title>Ether Balance</Step.Title>
                                <Step.Description></Step.Description>
                            </Step.Content>
                        </Step>
                        <Step completed={this.state.complete.weth} active={this.state.active.weth}>
                            <Step.Content>
                                <p></p>
                                <Step.Title>Wrapped Ether</Step.Title>
                                <Step.Description></Step.Description>
                            </Step.Content>
                        </Step>
                        <Step completed={this.state.complete.allowance} active={this.state.active.allowance}>
                            <Step.Content>
                                <p></p>
                                <Step.Title>Allowance to Tokens</Step.Title>
                                <Step.Description></Step.Description>
                            </Step.Content>
                        </Step>
                    </Step.Group>
                    <Segment attached>
                        {
                            (this.state.complete.eth === false) ? 
                                <p>You should have some ether balance to sign the transactions.</p> 
                            :
                            (this.state.complete.weth === false) ? 
                                <div>
                                    <p>You should have Wrapped Ether for trading.</p>
                                    <WrapUnWrapEther 
                                        from="ETH" 
                                        to="WETH" 
                                        {...this.props} 
                                        setBalanceAllowance={this.props.setBalanceAllowance}
                                    />
                                </div>
                            :
                            (this.state.complete.allowance === false) &&
                                <div>
                                    <p>You should give Allowance to Tokens in market in order to trade.</p>
                                        <div>
                                            
                                           { 
                                               this.props.allowance[this.props.tradingCoin] !== 0 ? (<span><Icon name="unlock" /> 
                                                    Allowance given for </span>) : 
                                                (
                                                    <span>
                                                        <Button name={this.props.tradingCoin} icon onClick={this.props.takeAllowance}>
                                                            <Icon name="lock" />
                                                        </Button> 
                                                         Please unlock 
                                                    </span>
                                                )
                                            }
                                            <span> {this.props.tradingCoin} </span>
                                        </div>
                                        <div>
                                            {
                                                this.props.allowance[this.props.exchangeCoin] !== 0 ? (<span><Icon name="unlock" /> 
                                                    Allowance given for </span>) : 
                                                (
                                                    <span>
                                                        <Button name={this.props.exchangeCoin} icon onClick={this.props.takeAllowance}>
                                                            <Icon name="lock" />
                                                        </Button> 
                                                         Please unlock 
                                                    </span>
                                                )
                                            }
                                             <span> {this.props.exchangeCoin} </span>
                                        </div>
                                </div>

                        }
                    </Segment>
                </div>
                </Modal.Description>
            </Modal.Content>
            </Modal>
            </div>
        )
    }
}

export default TradingSteps