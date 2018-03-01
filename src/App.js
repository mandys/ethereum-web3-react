import React, { Component } from 'react';
//import { promisifyAll } from 'bluebird'

import WithWeb3 from './WithWeb3';
//import ABIInterfaceArray from './util/ABI.json'

// import BnkGrid from './Bnkgrid'
import DisclaimerOverlay from './DisclaimerOverlay';
import { Grid, Container, Message } from 'semantic-ui-react'
// import BnkMessage from './Bnkmessage'
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';

//const SMART_CONTRACT_INSTANCE = '0xb3b18AfbE291E50E652ba5e3faFAbf0b566b804B'

//const constantsFromInterface = ABIInterfaceArray.filter( ABIinterface => ABIinterface.constant )
//const methodsFromInterface = ABIInterfaceArray.filter( ABIinterface => !ABIinterface.constant )

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="App">
                <DisclaimerOverlay />
                    {
                    this.props.notify.message && 
                    <Container>
                        <Grid >
                            <Grid.Row className='left aligned'>
                                <Grid.Column width={10}>
                                    <Wallet />
                                </Grid.Column>
                                <Grid.Column width={6} >
                                    <Message color={this.props.notify.level}>
                                        {this.props.notify.message}
                                        {
                                            this.props.notify.showMetamaskLink && 
                                                <span>To install Metamask <a rel="noopener noreferrer" href="https://metamask.io/" target="_blank">click here</a>.</span>
                                        }
                                    </Message>
                                    {
                                        !this.props.showMetamaskLink &&
                                            <div>
                                                <h5>Account Address</h5>
                                                    {this.props.fromAddress}
                                                <h5>Account Balance</h5>
                                                    {this.props.balance} ETH
                                                <h5>Transaction History</h5>
                                            </div>
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                    <Grid.Column width={16}>
                                        <TokenBalance />
                                    </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                    }
            </div>
        );
    }
}

export default WithWeb3(App);
