import React, { Component } from 'react';
import { Modal, Header, Button, Form, Segment, Grid, Divider, List } from 'semantic-ui-react'
import {human_standard_token_abi} from './util/contracts/human_standard_token_abi';
import WithWeb3 from './WithWeb3';
var axios = require('axios');

class TokenBalance extends Component {
    state = {
        tB: undefined,
        tS: undefined,
        tD: undefined,
        showCustomFrom:false,
        tokenOpts: [],
        stB: undefined,
        stS: undefined,
        stD: undefined,
        errorModal:false
    } 
    getBalance = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.balanceOf(address, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }
    componentDidMount = () => {
        let tokenOpts = []; 
        console.log("TOKEN BALANCE COMPONENT DID MOUNT");
        if (typeof(Storage) !== "undefined") { 
            if(localStorage.getItem("tokenOpts")) {
                tokenOpts = JSON.parse(localStorage.getItem("tokenOpts"));
            }
        }
        if(!tokenOpts.length) {
            axios.get('https://api.ethplorer.io/getTop?apiKey=freekey&limit=100')
            .then((response) => {
                let tokens = [];
                tokens = response.data.tokens.map((tokenData) => {
                    return {text: tokenData['name'], value: tokenData['address'], key: tokenData['symbol']};
                });
                if (typeof(Storage) !== "undefined") {
                    localStorage.setItem("tokenOpts", JSON.stringify(tokens));
                }
                this.setState({tokenOpts: tokens});
            })
            .catch((error) => {
                console.log(error);
            });
        } else {
            this.setState({tokenOpts: tokenOpts});
        }   
        
    }
    getDecimals = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.decimals(function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }

    getSymbol = async (tokenContractInstance, address) => {
        return new Promise (function (resolve, reject) {
            tokenContractInstance.symbol(function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }
    saveTokenContractAddress = async (e) => {
        try{
            const address = '0x17014e6c188315da868fbc380e144b6c77036b45';
            const contractAddress = e.target.tokenContractAddress.value;
            console.log(`contractAddr is ${contractAddress} `);
            const contractABI = human_standard_token_abi;
            const tokenContract = this.props.web3.eth.contract(contractABI);
            const tokenContractInstance = tokenContract.at(contractAddress);
            let tokenBalance = await this.getBalance(tokenContractInstance, address);
            let tokenDecimals = await this.getDecimals(tokenContractInstance, address);
            let tokenSymbol = await this.getSymbol(tokenContractInstance, address);
            tokenBalance = tokenBalance/Math.pow(10, tokenDecimals);
            this.setState({
                tB: tokenBalance,
                tD: tokenDecimals,
                tS: tokenSymbol,
            });
            console.log(`tokenBalance is ${tokenBalance}`);
            console.log(`tokenDecimals are ${tokenDecimals}`);
            console.log(`tokenSymbol is ${tokenSymbol}`);
        } catch (e) {
            this.setState({errorModal: true});
        }
    }

    getSelectedTokenBalance = async (e) => {
        try{
            if(e.target.value !== "") {
                console.log(this.props);
                const address = this.props.fromAddress;
                const contractAddress = e.target.value;
                console.log(`contractAddr is ${contractAddress} `);
                const contractABI = human_standard_token_abi;
                const tokenContract = this.props.web3.eth.contract(contractABI);
                const tokenContractInstance = tokenContract.at(contractAddress);
                let tokenBalance = await this.getBalance(tokenContractInstance, address);
                let tokenDecimals = await this.getDecimals(tokenContractInstance, address);
                let tokenSymbol = await this.getSymbol(tokenContractInstance, address);
                tokenBalance = tokenBalance/Math.pow(10, tokenDecimals);
                this.setState({
                    stB: tokenBalance,
                    stD: tokenDecimals,
                    stS: tokenSymbol,
                });
                console.log(`tokenBalance is ${tokenBalance}`);
                console.log(`tokenDecimals are ${tokenDecimals}`);
                console.log(`tokenSymbol is ${tokenSymbol}`);
            }
        } catch(e) {
            this.setState({errorModal: true});
        }  
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
    }

    showCustomFrom = (e) => {
        this.setState({
            showCustomFrom: true
        });
    }

    showTokens = (e) => {
        this.setState({
            showCustomFrom: false
        });
    }

    handleClose = (e) => {
        this.setState({
            errorModal: false
        });
    }

    render() {
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={8}>
                        <Segment>
                            <Header as='h2'>Token Balances</Header>
                            <Button.Group >
                                <Button primary onClick={this.showTokens}>Show All Tokens</Button>
                                <Button.Or />
                                <Button secondary onClick={this.showCustomFrom}>Add Custom Token</Button>
                            </Button.Group>
                            <Divider hidden />
                            {
                                (this.state.showCustomFrom === false) ? 
                                <div  className='field'>
                                    <select className='ui selection dropdown' onChange={this.getSelectedTokenBalance}>
                                        <option value="" key='null'>Select a token</option>
                                        {
                                            this.state.tokenOpts.map((token,i) => {
                                                return <option value={token.value} key={i}>{token.text}</option>
                                            })
                                        }
                                    </select>
                                    {
                                        (this.state.stB !== undefined) && 
                                        <List>
                                            <List.Item>Token Symbol: {this.state.stS}</List.Item>
                                            <List.Item>Token Balance: {this.state.stB}</List.Item>
                                        </List>
                                    }
                                </div>
                                :
                                <Form onSubmit={this.saveTokenContractAddress}>
                                    <Form.Field required={true}>
                                        <label>Token Contract Address</label>
                                        <input placeholder='Token Contract Address' value="0x9C8579DaB8cdd2d66eC0fd7FA34457684Bfd977F" name="tokenContractAddress" onChange={this.handleInputChange} />
                                    </Form.Field>
                                    {
                                        !this.state.tB && <Button color='blue'>Fetch Details</Button>
                                    }

                                    {
                                        this.state.tB &&
                                        <div>
                                            <Form.Field required={true}>
                                                <label>Token Symbol</label>
                                                <input placeholder='Token Symbol' name="tokenSymbol" onChange={this.handleInputChange} value={this.state.tS} />
                                            </Form.Field>
                                            <Form.Field required={true}>
                                                <label>Decimals</label>
                                                <input placeholder='Decimals' name="tokenDecimals" onChange={this.handleInputChange} value={this.state.tD} />
                                            </Form.Field>
                                            <Form.Field required={true}>
                                                <label>Tokens</label>
                                                <input placeholder='Tokens' name="tokenBalance" onChange={this.handleInputChange} value={this.state.tB} />
                                            </Form.Field>
                                            <Button type='submit'>Save</Button>
                                        </div>
                                    }
                                </Form>
                            }
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
                { 
                    this.state.errorModal && 
                    <Modal open={true} size='small'>
                        <Modal.Header>Error</Modal.Header>
                        <Modal.Content>
                            There is an error in fetch your details, Please try again after some time.
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color='red' onClick={this.handleClose}>Close</Button>
                        </Modal.Actions>
                    </Modal>
                }
            </Grid>
                
        )
    }
}

export default WithWeb3(TokenBalance);
