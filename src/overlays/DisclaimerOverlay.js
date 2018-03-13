import React, { Component } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react'

class DisclaimerOverlay extends Component {
    state = { 
        open:true
    }
    handleClose = () => {
        console.log('handleClose called');
        this.setState({
            open: false
        })
    }
    render() {
        return (
            <div>
                <Modal open={this.state.open}>
                <Modal.Header>Alpha Disclaimer</Modal.Header>
                <Modal.Content>
                <Modal.Description>
                    <Header>Dear User</Header>
                    <p>This product is offered by Binkd only to enable you to evaluate Binkd's upcoming product. It is important for you to understand that this prototype is not intended for qualification or use in production.</p>

                    <p>This prototype product is provided “AS IS” without any warranty whatsoever from Binkd. Further, Binkd may change the specifications for this prototype product without notice. Lastly, we ask that you give honest feedback on our prototype so we can take this into consideration for future development.</p>

                    <p>As this prototype is currently in its alpha stage, some elements such as the graph on your dashboard will take longer to load. We are working on our backend, which will enable loading times that are greatly reduced as this will be customized for this application.</p>

                    <p>Please take into account that this is not the final product and it does not reflect the final quality of the product with which we will go to market, but is intended to provide an indication of our plans.</p>
                </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='green' onClick={this.handleClose}>
                        <Icon name='checkmark' /> I Understand
                    </Button>
                </Modal.Actions>
            </Modal>
          </div>
        );
    }
}

export default DisclaimerOverlay;