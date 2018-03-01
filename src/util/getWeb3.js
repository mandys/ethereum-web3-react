import Web3 from 'web3'
import Promise, { promisifyAll } from 'bluebird'

const resolveWeb3 = (resolve) => {
    let {web3} = window
    const alreadyInjected = typeof web3 !== 'undefined' // i.e. Mist/Metamask
    const localProvider = `http://localhost:8545`

    if (alreadyInjected) {
        console.log(`Injected web3 detected.`)
        web3 = new Web3(web3.currentProvider)
    } else {
        console.log(`No web3 instance injected, using Local web3.`)
        const provider = new Web3.providers.HttpProvider(localProvider)
        web3 = new Web3(provider)
    }
    // wrap callback functions with promises
    promisifyAll(web3.eth, {suffix: 'Async'})
    promisifyAll(web3.net, {suffix: 'Async'})
    promisifyAll(web3.version, {suffix: 'Async'})
    resolve(web3)
}

export default() => new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection
    // timing.
    window.addEventListener(`load`, () => {
        resolveWeb3(resolve)
    })
    // If document has loaded already, try to get Web3 immediately.
    if (document.readyState === `complete`) {
        resolveWeb3(resolve)
    }
})