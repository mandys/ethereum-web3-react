
import React from 'react'
import getWeb3 from './util/getWeb3'

const WithWeb3 = PassedComponent => class extends React.Component {
  state = { web3: null }

  async componentDidMount () {
    try {
      const web3 = await getWeb3()
      this.setState({ web3 })
    } catch (error) {
      alert(`Failed to load web3.`)
      console.log(error)
    }
  }

  render () {
    const { web3 } = this.state
    return web3 ? <PassedComponent web3={web3} /> : <div>Loading Web3</div>
  }
}

export default WithWeb3