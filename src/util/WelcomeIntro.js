import React, { Component } from 'react';
import { Header, Container, Label, Table, Modal, Divider,Button, Icon } from 'semantic-ui-react'


class WelcomeIntro extends Component {
    state = { modalOpen: true }

    handleClose = () => this.setState({ modalOpen: false })
    render() {
        return (
            <Modal open={this.state.modalOpen} >
            <Container text={true}>
                <Divider hidden/>
                <Header size='large' textAlign='center'>Welcome to BDEX!</Header>
                <Table inverted >
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                <Label ribbon>1</Label>
                            </Table.Cell>
                            <Table.Cell>
                                <Header as='h3' color='green'> Connect your wallet </Header>
                                <p>Make sure your Metamask extension is unlocked</p>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                <Label ribbon>2</Label>
                            </Table.Cell>
                            <Table.Cell>
                                <Header as='h3' color='green'> Wrap some Ether </Header>
                                    <p>Go to your Wallets page and choose the 'Wrap/Unwrap ETH' link.
                                    </p>
                                    <p>Wrapped Ether, or WETH, is a tradeable version of regular Ether. 
                                        Ether needs to be wrapped to trade with it on Binkd. 
                                        You can unwrap your WETH back to ETH at any time. </p>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                <Label ribbon>3</Label>
                            </Table.Cell>
                            <Table.Cell>
                                <Header as='h3' color='green'> Unlock WETH (and any other tokens you'd like to trade) </Header>
                                <p>Click the Wallet Balances link in the main nav and find the row 
                                for WETH in the balances table on that page. Click the toggle to unlock the asset. 
                                If you have other tokens you'd like to trade, unlock those as well.
                                </p>

                                <p>
                                Token unlocking is what allows Ethereum to access tokens when an exchange is initiated. 
                                All assets need to be unlocked before you can use them on Binkd.</p>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                <Label ribbon>4</Label>
                            </Table.Cell>
                            <Table.Cell>
                                <Header as='h3' color='green'> Start trading! </Header>
                                <p>
                                    Now that you've unlocked your tokens, you can trade them in any of our listed markets.
                                </p>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>        
            </Container>
                <Modal.Actions>
                    <Button color='green' onClick={this.handleClose} inverted>
                        <Icon name='checkmark' /> Got it
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default WelcomeIntro;