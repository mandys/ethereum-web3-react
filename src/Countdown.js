
import React, { Component } from 'react';
import {Segment} from 'semantic-ui-react'

class Countdown extends Component {
    state = {
        days : 0,
        hours : 0,
        minutes : 0,
        seconds : 0,
    } 

    componentDidMount = () => {
        let countDownDate = new Date("March 14, 2018 23:59:59").getTime();
        let x = setInterval(() => {
            let now = new Date().getTime();            
            let distance = countDownDate - now;            
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);   
            this.setState({
                days:days,
                hours:hours,
                minutes:minutes,
                seconds:seconds
            })           
            
            if (distance < 0) {
                clearInterval(x);
            }
        }, 1000);
    }
   
    render() {
        return (
            <Segment >
                <div className="vtg-container">
                    <div id="tsTimer">
                        <div className="dpinline align-middle"><h4>BINK token pre-sale starts in</h4></div>
                        <div className="dpinline align-middle">
                            <div className="dpinline  text-center">{this.state.days}</div>d<span>:</span>
                            <div className="dpinline colhrs text-center">{this.state.hours}</div>h<span>:</span>
                            <div className="dpinline colmins text-center">{this.state.minutes}</div>m<span>:</span>
                            <div className="dpinline colsec text-center">{this.state.seconds}</div>s                    
                        </div>
                    </div>
                </div>
            </Segment>
        )
    }
}
export default Countdown;