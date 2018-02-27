import React from 'react'
import { Message } from 'semantic-ui-react'


const BnkMessage = (props) => (
      <Message color={props.level}>
        {props.message}
        {
          props.showMetamaskLink && <span>To install Metamask <a rel="noopener noreferrer" href="https://metamask.io/" target="_blank">click here</a>.</span>
        }
      </Message>
)
  
  export default BnkMessage

