import React, { Component } from 'react';
import {Segment} from 'semantic-ui-react'
// var QRCode = require('qrcode-react');
var QRCode = require('qrcode')

class QrCode extends Component {
    state = {
        address: ""
    } 

    componentDidMount = () => {
        QRCode.toCanvas(document.getElementById('canvas'), 
            "0x54Bee119B76bB331Bac3f3190Ce26f390c12a67B", 
            {
                errorCorrectionLevel: 'H',
            }, 
            (error) => {
                if(error) {
                    console.log(error);
                }
            });
    }
   

    render() {
        return (

            // <Segment >
            //     <QRCode value="0x54Bee119B76bB331Bac3f3190Ce26f390c12a67B"/>
            // </Segment>
            <Segment >
                <canvas id='canvas'/>
            </Segment>

        )
    }
}

export default QrCode;
