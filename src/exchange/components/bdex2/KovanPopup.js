import React, { Component } from 'react'
import {  Button, Header, Modal } from 'semantic-ui-react'

class KovanPopup extends Component {

  render() {
    return (
      <div>
        <Modal  open={this.props.showKovanPopup} closeOnDimmerClick={false} size='small'>
          <Modal.Header>Alpha disclaimer!</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              Alpha version will only work in Kovan test network, Please switch to Kovan test net before proceeding.
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}

export default KovanPopup
