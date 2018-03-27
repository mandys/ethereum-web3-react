import React, { Component } from 'react';
import { Button, Modal, Grid,Image,Divider } from 'semantic-ui-react'
import { BigNumber } from '@0xproject/utils';
import { ZeroEx } from '0x.js';
import Exchange from '../Exchange';

class WrapUnWrapEther extends Component {
    state = {
        showOverlay: false,
        disabled: false,
        labels:{
            ETH: {
                name: 'Ether',
                label: 'Wrap'
            },
            WETH: {
                name: 'Wrapped Ether',
                label: 'UnWrap'
            }
        }
    }
    showWrapOverlay = async (e, token) => {
        this.setState({
            showOverlay: true,
        });
    }

    closeOverlay = async (e, token) => {
        this.setState({
            showOverlay: false
        });
    }

    wrapEther = async () => {
        try {
            console.log(this.refs.amount.value);
            const ethAmount = new BigNumber(this.refs.amount.value);
            const decimals = 18;
            const ethToConvert = ZeroEx.toBaseUnitAmount(ethAmount, decimals); // Number of ETH to convert to WETH
            console.log('ethToCovert', ethToConvert);
            console.log('ethAddress', this.props.tokenContractAddresses['WETH'])
            this.setState({
                showOverlay: false,
                disabled:true
            });
            const convertEthTxHash = await this.props.zeroEx.etherToken.depositAsync(this.props.tokenContractAddresses['WETH'], ethToConvert, this.props.ownerAddress);
            console.log('convertEthTxHash', convertEthTxHash);
            let transactionMined = await this.props.zeroEx.awaitTransactionMinedAsync(convertEthTxHash);
            console.log('transactionMined',transactionMined);
            this.props.setBalanceAllowance();
            this.setState({
                disabled:false
            });
        } catch (e) {
            this.setState({
                showOverlay: false
            });
            console.log(e);
        }
    }

    unWrapEther = async () => {
        try {
            console.log(this.refs.amount.value);
            const ethAmount = new BigNumber(this.refs.amount.value);
            const decimals = 18;
            const ethToConvert = ZeroEx.toBaseUnitAmount(ethAmount, decimals); // Number of ETH to convert to WETH
            console.log('wethToCovert', ethToConvert);
            console.log('wethAddress', this.props.tokenContractAddresses['WETH'])
            this.setState({
                showOverlay: false,
                disabled:true
            });
            const convertWethTxHash = await this.props.zeroEx.etherToken.withdrawAsync(this.props.tokenContractAddresses['WETH'], ethToConvert, this.props.ownerAddress);
            console.log('convertWEthTxHash', convertWethTxHash);
            let transactionMined = await this.props.zeroEx.awaitTransactionMinedAsync(convertWethTxHash);
            console.log('transactionMined',transactionMined);
            this.setState({
                disabled:false
            });
        } catch (e) {
            this.setState({
                showOverlay: false
            });
            console.log(e);
        }
    }

    render() {
        return (
            <div>
                <Button size='mini' onClick={(e) => this.showWrapOverlay(e, 'WETH')} disabled={this.state.disabled}>
                    {this.state.labels[this.props.from].label}
                </Button>

                <Modal open={this.state.showOverlay} size="mini">
                    <Modal.Header>{this.state.labels[this.props.from].label} Ether</Modal.Header>
                    <Modal.Content>
                        <p>Convert your Ether into a tokenized, tradable form.</p>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    {this.state.labels[this.props.from].name}
                                    <Image src='/src/icons/eth.png' size='mini' />
                                    ({this.props.from})
                                </Grid.Column>
                                <Grid.Column  width={8}>
                                    {this.state.labels[this.props.to].name}
                                    <Image src='/src/icons/eth.png' size='mini' />
                                    ({this.props.to})
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Divider />
                        <div className="ui fluid focus right labeled input">
                            <input type="number" placeholder="Amount" ref='amount'/>
                            <div className="ui basic label label">{this.props.from}</div>
                        </div>
                        <p>1 {this.props.from} = 1 {this.props.to}</p>
                        <Divider />
                        <Button.Group widths='2'>
                            <Button content='CANCEL' onClick={this.closeOverlay} />
                            {
                                (this.props.from === "ETH") ?
                                <Button color='blue' content='CONVERT'  onClick={this.wrapEther} />
                                :
                                <Button color='blue' content='CONVERT'  onClick={this.unWrapEther}/>
                            }
                        </Button.Group>
                    </Modal.Content>
                </Modal>
            </div>
        );
    }
}

export default WrapUnWrapEther;