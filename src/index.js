import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';
import WithWeb3 from './WithWeb3';
import Presale from './Presale';
import WalletBalance from './exchange/components/WalletBalances';
import BuySellToken from './exchange/components/BuySellToken';
import Bdex from './exchange/Bdex';
import Bdex2 from './exchange/Bdex2';
import WelcomeIntro from './util/WelcomeIntro';

const url = require("url");

function getUrlVars() {
    return url.parse(window.location.href);
}

let urlParams = getUrlVars();

console.log(urlParams);

switch (urlParams["pathname"]) {
        case "/wallet":
        ReactDOM.render(
            <Wallet />, document.getElementById('root'));
        break;
        case "/web3":
        ReactDOM.render(
            <WithWeb3 />, document.getElementById('root'));
        break;
        case "/tokenbalance":
        ReactDOM.render(
            <TokenBalance />, document.getElementById('root'));
        break;        
        case "/Presale":
        ReactDOM.render(
            <Presale />, document.getElementById('root'));
        break;
        case "/WalletBalance":
        ReactDOM.render(
            <WalletBalance />, document.getElementById('root'));
        break;
        case "/BuySellToken":
        ReactDOM.render(
            <BuySellToken />, document.getElementById('root'));
        break;
        case "/WelcomeIntro":
            ReactDOM.render(
                <WelcomeIntro />, document.getElementById('root'));
        break;
        case "/Bdex":
        ReactDOM.render(
            <Bdex />, document.getElementById('root'));
        break;
        case "/Bdex2":
        ReactDOM.render(
            <Bdex2 />, document.getElementById('root'));
        break;
        case undefined:
        default:
        ReactDOM.render(
            <App/>, document.getElementById('root'));
        break;
}

// registerServiceWorker();
