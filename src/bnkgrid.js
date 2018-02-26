import React from 'react'
import { Grid } from 'semantic-ui-react'
import BnkMessage from './bnkmessage'

const BnkGrid = (props) => (
  <Grid celled>
    <Grid.Row>
      <Grid.Column width={10}>
        
      </Grid.Column>
      <Grid.Column width={6}>
        <h5>Account Address</h5>
        0x4Bb05231389045fbfb633E93C01d2A9346289D06
        <h5>Account Balance</h5>
        0 ETH
        Transaction History
        <BnkMessage 
            message={props.message} 
            level={props.level}
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default BnkGrid