import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Wallet from './Wallet';
import TokenBalance from './TokenBalance';

import DisclaimerOverlay from './DisclaimerOverlay';

function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window
        .location
        .href
        .slice(window.location.href.indexOf('?') + 1)
        .split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

let urlParams = getUrlVars();

console.log(urlParams);

switch (urlParams["page"]) {
    case "wallet":
        ReactDOM.render(
            <Wallet />, document.getElementById('root'));
        break;
        case "tokenbalance":
        ReactDOM.render(
            <TokenBalance />, document.getElementById('root'));
        break;        
        case "DisclaimerOverlay":
        ReactDOM.render(
            <DisclaimerOverlay />, document.getElementById('root'));
        break;
    case undefined:
    default:
        ReactDOM.render(
            <App/>, document.getElementById('root'));
        break;
}

registerServiceWorker();
