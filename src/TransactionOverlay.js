import React, { Component } from 'react';
import  { Button, Header, Modal, Grid, Icon } from 'semantic-ui-react'
import BlockiesIdenticon from "./BlockiesIdenticon"
// var Identification = require('identicon');

class TransactionOverlay extends Component {
    render() {
        return (
            <Modal open={true}>
                <Modal.Header>You are about to send</Modal.Header>
                <Modal.Content>
                        <Grid>
                        <Grid.Row textAlign='center'>
                            <Grid.Column width={7}>
                                <BlockiesIdenticon opts={{seed: this.props.fromAddress, color: 'blue'}} />
                                <p>{this.props.fromAddress}</p>
                            </Grid.Column>
                            <Grid.Column width={2}>
                                <Header> 
                                    <Icon name="arrow circle right" /> 
                                    <p> {this.props.amount}  ETH</p>
                                </Header>
                            </Grid.Column>
                            <Grid.Column width={7}>
                                <BlockiesIdenticon opts={{seed: this.props.toAddress, color: 'green'}} />
                                <p>{this.props.toAddress}</p>
                            </Grid.Column>
                        </Grid.Row>
                        </Grid>
                    <Modal.Description>
                        
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.handleClose}>No, get me out of here!</Button>
                    <Button primary onClick={this.props.generateTransaction} >Yes, I am sure! Make transaction.</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default TransactionOverlay;