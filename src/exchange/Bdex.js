import WalletBalance from './components/WalletBalances'
import BuySellTokens from './components/BuySellToken'
import WelcomeIntro from '../util/WelcomeIntro'
import { Table,Container,Checkbox, Divider } from 'semantic-ui-react'
import React, { Component } from 'react';

class Bdex extends Component {
    render() {
        return  <Container>
                    <WalletBalance />
                    <Divider />
                    <BuySellTokens />
                    <WelcomeIntro />
                </Container>
    }
    
};

export default Bdex