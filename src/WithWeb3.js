import React from 'react'
import getWeb3 from './util/getWeb3'

const WithWeb3 = (PassedComponent) => class extends React.Component {
    state = {
        web3: null,
        fromAddress: ''
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3()
            this.setState({web3})
            const accounts = await web3.eth.getAccountsAsync();
            this.setState({fromAddress: accounts[0]})
        } catch (error) {
            alert(`Failed to load web3.`)
            console.log(error)
        }
    }

    render() {
        const {web3, fromAddress} = this.state
        return web3 ? <PassedComponent fromAddress={fromAddress} web3={web3}/> : <div>Loading Web3</div>
    }
}

export default WithWeb3