import React, { Component } from 'react'
import {  Button, Header, Modal } from 'semantic-ui-react'
var store = require('store')
var expirePlugin = require('store/plugins/expire')
store.addPlugin(expirePlugin)

class KovanPopup extends Component {
  state = { kovanModalShown: false }

  close = () => {
    store.set('kovanModalShown', 1, new Date().getTime() + 60*60*1000)
    this.setState({ kovanModalShown: false });
  } 
    
  componentDidMount = () => {
    const kovanModalShown = store.get('kovanModalShown')
    console.log('modalShown', kovanModalShown);
    if(kovanModalShown !== 1) {
        this.setState({ kovanModalShown: true })
    }
  }
  render() {

    return (
      <div>
        <Modal  open={this.state.kovanModalShown} onClose={this.close}>
          <Modal.Header>Alpha disclaimer!</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              Alpha version will only work in kovan test network, Please make sure you are on kovan test net before proceeding.
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button positive icon='checkmark' labelPosition='right' content="Got it" onClick={this.close} />
          </Modal.Actions>
        </Modal>
      </div>
    )
  }
}

export default KovanPopup
