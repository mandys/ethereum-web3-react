import React, { Component } from 'react';
import {Grid, Container} from 'semantic-ui-react'
import WithWeb3 from './WithWeb3'
import Calculate from './presale/Calculate'
import PriceBox from './presale/PriceBox'
import Referral from './presale/Referral'
import Transactions from './presale/Transactions'
import Countdown from './presale/Countdown'
import BinkToken from './presale/BinkToken'

class Presale extends Component {

    render() {
        return (
            <Container>
                <Grid>
                    <Grid.Row stretched>
                        <Grid.Column>
                            <Countdown/>       
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row stretched>
                        <Grid.Column width="6">
                            <BinkToken />                        
                            <Calculate />
                            <Referral />
                        </Grid.Column>
                        <Grid.Column width="10">
                            <PriceBox />                            
                            <Transactions/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

export default WithWeb3(Presale);


