import React from 'react'
import { Grid, Container } from 'semantic-ui-react'
import BnkMessage from './Bnkmessage'
import Wallet from './Wallet';

const BnkGrid = (props) => (
    <Container>
        <Grid >
            <Grid.Row className='left aligned'>
                <Grid.Column width={10}>
                    <Wallet fromAddress={props.account} balance={props.accountsMap[props.account]} validateEthereAddress={props.validateEthereAddress} />
                </Grid.Column>
                <Grid.Column width={6} >
                    <BnkMessage
                        message={props.message}
                        level={props.level}
                        showMetamaskLink={props.showMetamaskLink}
                    />
                    {
                        !props.showMetamaskLink &&
                            <div>
                                <h5>Account Address</h5>
                                    {props.account}
                                <h5>Account Balance</h5>
                                    {props.accountsMap[props.account]} ETH
                                <h5>Transaction History</h5>
                            </div>
                    }
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Container>
)

export default BnkGrid