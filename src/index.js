import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Wallet from './Wallet';

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

    case undefined:
    default:
        ReactDOM.render(
            <App/>, document.getElementById('root'));
        break;
}

registerServiceWorker();
