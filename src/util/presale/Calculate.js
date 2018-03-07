import React, { Component } from 'react';
import {Divider, Button, Label, Form, Segment} from 'semantic-ui-react'


class Calculate extends Component {
    state = {
    } 

    componentDidMount = () => {

    }
   
    render() {
        return (
            <Segment >
                <Form size="small">
                    <Form.Group inline>
                        <Label pointing='right'>You Pay</Label> 
                        <Form.Field label='' placeholder="" control='input' type='number'/>
                        <Label pointing='left'>ETH</Label>
                    </Form.Group>   
                    <Form.Group inline>
                        <Label pointing='right'>You Buy</Label>
                        <Form.Field label='' placeholder="" control='input' type='number' />
                        <Label pointing='left'>BINK</Label>
                    </Form.Group> 
                    <Form.Group inline>
                        <Button>Buy Token</Button>                   
                    </Form.Group>     
                </Form>
            </Segment>
        )
    }
}

export default Calculate;
