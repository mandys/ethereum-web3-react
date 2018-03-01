import React, { Component } from 'react';
import { Container, Header, Button, Form, Message, Modal, Segment } from 'semantic-ui-react'
import TransactionOverlay from './TransactionOverlay'
import WithWeb3 from './WithWeb3';

class Wallet extends Component {
    state = {
        toAddressError: false,
        amountToSendError: false,
        showTransactionOverlay: false,
        from: "",
        to: "",
        amount: "",
        transactionError:false,
        transactionSuccess:false,
        txHash:''
    }
    componentDidMount = () => {
        console.log("COMPONENT MOUNTED WITH FOLLOWING PROPS");
        console.log(this.props);
    }

    generateTransaction = async() => {
        this.setState({showTransactionOverlay: false});
        console.log('GENERATE TRANSACTION CALLED, LETS SEE PROPS');
        console.log(this.props.web3);
        const fromAddress = this.refs.fromAddress.value;
        const toAddress = this.refs.toAddress.value;
        const eherToSend = this.refs.amountToSend.value;
        let amountToSend;
        try {
            amountToSend = this.props.web3.toWei(eherToSend, 'ether');
        } catch(err) {
            console.log(err);
        }
        
        console.log(amountToSend);
        console.log(this.props.web3);
        try {
            const tx = await this.props.web3.eth.sendTransactionAsync({
                from: fromAddress,
                to: toAddress,
                value: amountToSend
            });
            console.log(tx);
            this.checkTransation(tx);
        } catch(error) {
            this.setState({
                transactionError: true
            });
            console.log(error); 
        }

    }

    checkTransation = async(tx) => {
        // const tx= "0x9627c4c528ebaaa0746072c9141e1aafe8a8ec2ec1631e8bd0b3cfe678dac296";
        let status =  await this.props.web3.eth.getTransactionAsync(tx);
        this.setState({
            txHash: status.hash,
            transactionSuccess: true
        });
    }
    
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    validateEthereAddress = () => {
        const ethRecipientAddress = this.refs.toAddress.value;
        let addressError = this.props.web3.isAddress(ethRecipientAddress)
        this.setState({
            toAddressError: !addressError
        })
        return addressError;
    }
    amountToSend = () => {
        let amountToSend = parseFloat(this.refs.amountToSend.value, 10);
        if (!isNaN(amountToSend)) {
            console.log('amountToTransfer', amountToSend);
            amountToSend = this.props.web3.toWei(amountToSend, 'ether');
            console.log(amountToSend);
            this.setState({
                amountToSendError: false
            })
            return true;
        } else {
            this.setState({
                amountToSendError: true
            })
            return false;
        }
    }
    validateData = async(e) => {
        e.preventDefault();
        console.log('generateTransaction called');
        if(this.validateEthereAddress() && this.amountToSend()){
            try {
                this.setState({
                    from: e.target.fromAddress.value,
                    to: e.target.toAddress.value,
                    amount: e.target.amountToSend.value,
                    showTransactionOverlay: true
                });
            } catch(error) {
                console.log(error); 
            }
        }
    }
    handleClose = (e) => {
        this.setState({
            showTransactionOverlay: false,
            transactionError: false,
            transactionSuccess: false
        });
    }



    render() {
        return (
            <Container>
                <Header as='h1'>Send Ether & Tokens</Header>
                <Form onSubmit={this.validateData}>
                    <Form.Field disabled={true}>
                        <label>From Address</label>
                        <input placeholder='From Address' value={this.props.fromAddress} name="fromAddress" ref="fromAddress" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field error={this.state.toAddressError} required={true}>
                        <label>To Address</label>
                        <input placeholder='To Address' name="toAddress" onBlur={this.validateEthereAddress} ref="toAddress"/>
                    </Form.Field>
                    { this.state.toAddressError && 
                        <Message color='red'>
                            Not a valid transaction address.
                        </Message>
                    }
                    <Form.Field required={true} error={this.state.amountToSendError}>
                        <label>Amount to Send</label>
                        <input placeholder='Enter the amount' name="amountToSend" onBlur={this.amountToSend}  ref="amountToSend"/>
                    </Form.Field>
                    { this.state.amountToSendError && 
                        <Message color='red'>
                            Please enter valid amount to transfer.
                        </Message>
                    }
                    <Button type='submit'>Generate Transaction</Button>
            </Form>
                { 
                    this.state.showTransactionOverlay && 
                    <TransactionOverlay 
                        fromAddress={this.state.from} 
                        toAddress={this.state.to}
                        amount={this.state.amount}
                        generateTransaction={this.generateTransaction}
                        handleClose={this.handleClose}
                    />
                }
                { 
                    this.state.transactionError && 
                    <Modal open={true} size='small'>
                        <Modal.Header>Error</Modal.Header>
                        <Modal.Content>
                            There is an error in signing your transaction! please refresh your page and try again.
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color='red' onClick={this.handleClose}>Close</Button>
                        </Modal.Actions>
                    </Modal>
                }
                { 
                    this.state.transactionSuccess && 
                    <Segment color='green' clearing>
                        <p>Your TX has been broadcast to the network. This does not mean it has been mined & sent. 
                        During times of extreme volume, it may take 3+ hours to send.
                        </p>
                        <p>1) Check your TX below.</p>
                        <p>2) If it is pending for hours or disappears, use the Check TX Status Page to replace.</p>
                        <p>3) Use ETH Gas Station to see what gas price is optimal.</p>
                        <p>4) Save your TX Hash in case you need it later: {this.state.txHash}</p>
                        <Button floated='right' color='green' onClick={this.handleClose}>
                            Close
                        </Button>
                    </Segment>
                }
            </Container>
        );
    }
}

export default WithWeb3(Wallet);
