import React from 'react'
import { Message } from 'semantic-ui-react'


const BnkMessage = (props) => (
      <Message color={props.level}>{props.message}</Message>
)
  
  export default BnkMessage

