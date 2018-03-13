import React, { Component } from 'react';
import getWeb3 from './util/getWeb3';

class Web3 extends Component {
    constructor(props) {
      super(props);
      this.state = { web3: null };
    }
    componentDidMount = async () => {
        console.log('componentdid mount from Web3.js');
        try {
            const web3 = await getWeb3();
            this.setState({
                web3: web3
            })
        } catch(err) {
            console.log(err);
        }
    }

    render() {
        console.log(this.state);
        return (
            <div>
                {/*
                    Instead of providing a static representation of what <Mouse> renders,
                    use the `render` prop to dynamically determine what to render.
                */}
                {this.props.children(this.state)}
            </div>
        );
    }
  }

export default Web3;