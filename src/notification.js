import React, { Component } from 'react';

var NotificationSystem = require('react-notification-system');

class Notify extends Component {
    constructor(props) {
        super(props);
        this._notificationSystem = null
        this.state = {
            uid : 0
        }
        
    }
    _addNotification() {
        console.log(this.props);
        if(this._notificationSystem) {
            let notification = this._notificationSystem.addNotification(this.props);
            console.log(notification);
            this.setState({uid: notification.uid});
        }
    }
     
    componentDidMount() {
        this._notificationSystem = this.refs.notificationSystem;
        this._addNotification();
        console.log("componentDidMount");
    }

    componentDidUpdate(prevProps) {
        console.log("componentDidUpdate")
        console.log(this.props);
        if(prevProps.message != this.props.message) {
            this._notificationSystem.addNotification(this.props);
        }
       
    }

    render() {
        return (
            <div>
                <h1>Welcome to Binkd</h1>
                <NotificationSystem ref="notificationSystem" />
            </div>
        );
    }
}


export default Notify;