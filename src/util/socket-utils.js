
import io from 'socket.io-client';
var url = require('url');
class socketUtil {
    constructor() {
        var host = url.parse(window.location.href, true).host;
        if(host === 'localhost:3000') {
            this.socketend = 'http://localhost:3001'
            // this.socketend = 'http://www-qaapi.binkd.com:80'
        } else {
            this.socketend = 'http://www-qaapi.binkd.com:80'
        }
        this.socket = io(`${this.socketend}`);
    }

    addOrder = (order) => {
        this.socket.emit('addorder', order, (err) => {
            console.log('addorder error', err);
        });
    }

    fillOrder = (orderHash) => {
        this.socket.emit('fillorder', {
            "hash": orderHash
        }, (err) => {
            console.log('fillorder error', err);
        });
    }

    cancelOrder = (orderHash) => {
        this.socket.emit('cancelorder', {
            "hash": orderHash
        }, (err) => {
            console.log('cancelorder error', err);
        });
    }

}

export default socketUtil;
