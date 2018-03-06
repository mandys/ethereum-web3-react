import React, { Component } from 'react';
import {Segment} from 'semantic-ui-react'


class PriceBox extends Component {
    state = {
    } 

    componentDidMount = () => {

    }
   

    render() {
        return (
            <Segment >
                <div className="divsection col">
                    <h1>BINK</h1>
                    <div>Pre-Sale Hard Cap: $1.5M</div>
                    <div>33% Discount for all participants during Pre-sale</div>
                    <div>Minimum Purchase During Pre-sale : 0.5 ETH</div>
                    <div>Maximum Individual Purchase During Pre-sale: 35 ETH</div>
                    <div> 1 ETH = $835</div>
                </div>  
            </Segment>

        )
    }
}

export default PriceBox;
