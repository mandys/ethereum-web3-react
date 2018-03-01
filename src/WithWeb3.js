import React, { Component } from 'react';
import Web3 from './Web3';

class WithWeb3 extends Component {
    state = {  }
    render() {
        return (
            <div>
                <h1>WithWeb3</h1>
                <Web3 render={web3global => (
                    <div>
                        {
                            web3global.web3 ? <div>Web3 has loaded Gentlemen!</div> : <div>Loading...</div>
                        }
                    </div>
                )} />
            </div>
        );
    }
}

export default WithWeb3;