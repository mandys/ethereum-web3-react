import React, { Component } from 'react';
import {Grid, Segment, Container} from 'semantic-ui-react'
import WithWeb3 from './WithWeb3'
import Calculate from './Calculate'
import PriceBox from './PriceBox'
import Referral from './Referral'
import Transactions from './Transactions'
import Countdown from './Countdown'

class Presale extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container>
                <Grid>
                <Grid.Row>
                <Grid.Column width="6">
                <Calculate />
                <Referral />
                </Grid.Column>
                <Grid.Column width="10">
                <Countdown/>
                <PriceBox />
                </Grid.Column>
                </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

export default WithWeb3(Presale);


