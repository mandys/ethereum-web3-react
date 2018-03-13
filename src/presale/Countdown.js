
import React, { Component } from 'react';
import {Label} from 'semantic-ui-react';

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
            <div className="vtg-container">
                <div id="tsTimer">                   
                    <Label.Group size='small'>   
                        <Label>BINK token pre-sale starts in</Label>                     
                        <Label>{this.state.days} d</Label>
                        <Label>{this.state.hours} h</Label>
                        <Label>{this.state.minutes} m</Label>
                        <Label>{this.state.seconds} s</Label>
                    </Label.Group>       
                </div>
            </div>
        )
    }
}
export default Countdown;
