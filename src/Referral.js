import React, { Component } from 'react';
import {Segment} from 'semantic-ui-react'


class Refferal extends Component {
    state = {
        address: ""
    } 

    componentDidMount = () => {

    }
   

    render() {
        return (
            <Segment >
                <h2>Referral</h2>
                
                <b>Your referral link:</b>
                <p>You will get 2% of all contributions from your referrals. 
                Your friend will get 2% of all contributions from your referrals. 
                You can freely share this link in social networks and communities. 
                Your referral earnings will be distributed after ICO ends.
                </p>
            </Segment>
        )
    }
}

export default Refferal;
