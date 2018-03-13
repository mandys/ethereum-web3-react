import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';
import WithWeb3 from './WithWeb3';
import Presale from './Presale';
import Exchange from './exchange/Exchange';

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
        case "/Exchange":
        ReactDOM.render(
            <Exchange />, document.getElementById('root'));
        break;
    case undefined:
    default:
        ReactDOM.render(
            <App/>, document.getElementById('root'));
        break;
}

// registerServiceWorker();
