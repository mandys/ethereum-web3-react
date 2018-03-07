import React, { Component } from 'react';
import {Grid, Segment, Container} from 'semantic-ui-react'
import WithWeb3 from './WithWeb3'
import Calculate from './util/presale/Calculate'
import PriceBox from './util/presale/PriceBox'
import Referral from './util/presale/Referral'
import Transactions from './util/presale/Transactions'
import Countdown from './util/presale/Countdown'

class Presale extends Component {
    constructor(props) {
        super(props);
    }

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


