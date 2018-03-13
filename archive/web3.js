import { default as Web3 } from 'web3';
import Promise, { promisifyAll } from 'bluebird'

export const getWeb3Async = () => new Promise((resolve, reject) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function () {
    let web3 = window.web3

    if (typeof web3 !== 'undefined') {
      // Injected Web3 detected. Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)
      console.log('Metamask Loaded')
    } else {
      // No web3 instance injected, using Local web3.
      const provider = new Web3.providers.HttpProvider('http://localhost:8545')
      web3 = new Web3(provider)
    }
    console.log('logging web3');
    console.log(web3);
    // wrap callback functions with promises
    promisifyAll(web3.eth, {suffix: 'Async'})
    promisifyAll(web3.net, {suffix: 'Async'})
    promisifyAll(web3.version, {suffix: 'Async'})
    resolve(web3)
  })
})