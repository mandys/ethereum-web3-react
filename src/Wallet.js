import React, { Component } from 'react';
import { Container, Header, Button, Form, Message } from 'semantic-ui-react'

class Wallet extends Component {
    state = {
        toAddressError: false,
        amountToSendError: false
    } 
    generateTransaction = async(e) => {
        e.preventDefault();
        console.log('generateTransaction called');
        const fromAddress = e.target.fromAddress.value;
        const toAddress = e.target.toAddress.value;
        const amountToSend = e.target.amountToSend.value;
        console.log(amountToSend);
        console.log(this.props.web3);
        try {
            const tx = await this.props.web3.eth.sendTransactionAsync({
                from: fromAddress,
                to: toAddress,
                value: amountToSend
            });
            console.log(tx);
        } catch(error) {
            console.log(error);
        }

    }
    handleChange(event) {
        this.setState({fromAddress: event.target.value});
    }
    validateEthereAddress = (e) => {
        const ethRecipientAddress = e.target.value;
        console.log('ethRecipientAddress', ethRecipientAddress);
        this.setState({
            toAddressError: !this.props.web3.isAddress(ethRecipientAddress)
        })
    }
    amountToSend = (e) => {
        console.log('amount', e.target.value);
        let amountToSend = parseInt(e.target.value, 10);
        if (!isNaN(amountToSend)) {
            console.log('amountToTransfer', amountToSend);
            amountToSend = this.props.web3.fromWei(amountToSend, 'ether');
            console.log(amountToSend)
        } else {
            this.setState({
                amountToSendError: true
            })
        }
;
    }
    render() {
        return (
            <Container>
                <Header as='h1'>Send Ether & Tokens</Header>
                <Form onSubmit={this.generateTransaction}>
                    <Form.Field disabled={true}>
                        <label>From Address</label>
                        <input placeholder='From Address' value={this.props.fromAddress} name="fromAddress" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field error={this.state.toAddressError} required={true}>
                        <label>To Address</label>
                        <input placeholder='To Address' name="toAddress" onBlur={this.validateEthereAddress}/>
                    </Form.Field>
                    { this.state.toAddressError && 
                        <Message color='red'>
                            Not a valid transaction address.
                        </Message>
                    }
                    <Form.Field required={true} error={this.state.amountToSendError}>
                        <label>Amount to Send</label>
                        <input placeholder='Enter the amount' name="amountToSend" onBlur={this.amountToSend} />
                    </Form.Field>
                    { this.state.amountToSendError && 
                        <Message color='red'>
                            Please enter valid amount to transfer.
                        </Message>
                    }
                    <Button type='submit'>Generate Transaction</Button>
            </Form>
            </Container>
        );
    }
}

export default Wallet;
