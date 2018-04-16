import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import { Container, Segment, Menu, Icon, Image, Popup, Dropdown, Rail, Message } from 'semantic-ui-react'
import Exchange from './Exchange'
import App from './Bdex2'
import WelcomeIntro from '../util/WelcomeIntro'
import Account from './components/bdex2/Account'
import Support from './components/bdex2/Support'
import './css/App.css'

import BdexUtil from '../util/bdex-utils'

class BdexRouter extends Component {
    socketUtil= null;
    constructor(props) {
        super(props);
        this.state = { 
            activeItem: '/',
            message:'',
            messageClass:''
        };
        this.bdexUtil = new BdexUtil(this.props.web3, this.props.zeroEx);
    }

    componentDidMount = () => {
        
    }
    handleMessageDismiss = () => {
        this.setState({
            message: ''
        })
    }
    showMessage = (messageClass, message) => {
        this.setState({
            messageClass: messageClass,
            message: message
        })
    }
    handleItemClick = (e, data) => {
        this.setState({
            activeItem: data.name
        })
    }
    render() {
        const { activeItem } = this.state
        return (
            <BrowserRouter>
                <Container fluid>
                    <Segment raised inverted color='blue'>
                        <Menu borderless color='blue' inverted size='large'>
                            <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick}>
                                <Image src='https://www.binkd.com/img/home/binkd_brand_name.png' size='small' />
                            </Menu.Item>
                            <Menu.Item active={activeItem === 'Markets'} >
                                <Dropdown item text="Markets" floating button>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to='/zrx-weth' name='Markets' onClick={this.handleItemClick}>ZRX / WETH</Dropdown.Item>
                                        <Dropdown.Item as={Link} to='/zrx-dai' name='Markets' onClick={this.handleItemClick}>ZRX / DAI</Dropdown.Item>
                                        <Dropdown.Item as={Link} to='/bink-weth' name='Markets' onClick={this.handleItemClick}>BINK / WETH</Dropdown.Item>
                                        <Dropdown.Item as={Link} to='/bink-dai' name='Markets' onClick={this.handleItemClick}>BINK / DAI</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Menu.Item>
                            <Menu.Item as={Link} to='/' name='Welcome' active={activeItem === 'Welcome' || activeItem === '/'} onClick={this.handleItemClick} />
                            <Menu.Item as={Link} to='/account' name='Account' active={activeItem === 'Account'} onClick={this.handleItemClick} />
                            <Menu.Item as={Link} to='/support' name='Support' active={activeItem === 'Support'} onClick={this.handleItemClick} />
                            <Menu.Menu position='right'>
                                <Menu.Item as='a'>
                                    {
                                        this.props.ownerAddress ? 
                                        (
                                            <span>Address: <Icon name="user circle" />{this.props.ownerAddress}</span>
                                        ) 
                                        : 
                                        (
                                            <Segment raised secondary>  
                                                <Popup
                                                    trigger={<span><Icon color="red" name="warning sign" />Connect a Wallet</span>}
                                                    content="Please make sure you have Metamask installed and it's in unlocked state!"
                                                />
                                            </Segment>
                                        )
                                    }
                                    
                                </Menu.Item>
                                <Menu.Item>
                                    <Icon name="bell outline" size="large" />
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>
                    
                
                        <Switch>
                            <Route path="/" exact component={WelcomeIntro} />
                            <Route path="/account" render={props => <Account {...props} {...this.props} 
                                    bdexUtil={this.bdexUtil} showMessage={this.showMessage}/>}  />
                            <Route path="/support" component={Support} />
                            <Route render={props => <App {...props} {...this.props} socket={this.socket} 
                                    bdexUtil={this.bdexUtil}  showMessage={this.showMessage}/>} />
                        </Switch>
                    </Segment>
                    {
                        (this.state.message !== '') && 
                        <Rail attached internal position='right' style={{marginTop:60, marginRight:20,height:60}}>
                            <Message color={this.state.messageClass} 
                                content={this.state.message}
                                onDismiss={this.handleMessageDismiss}
                            />
                        </Rail> 
                    }
                    
                </Container>
            </BrowserRouter>
        );
    }
}

export default Exchange(BdexRouter);