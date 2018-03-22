import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import { Container, Segment, Menu, Icon, Image, Popup, Dropdown } from 'semantic-ui-react'
import Exchange from './Exchange'
import App from './Bdex2'
import WelcomeIntro from '../util/WelcomeIntro'
import Account from './components/bdex2/Account'
import Support from './components/bdex2/Support'

class BdexRouter extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            activeItem: 'Markets'
         };
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
                    <Segment raised inverted>
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
                            <Menu.Item as={Link} to='/welcome' name='Welcome' active={activeItem === 'Welcome'} onClick={this.handleItemClick} />
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
                            <Route exact path="/" render={props => <App {...this.props} />} />
                            <Route path="/welcome" component={WelcomeIntro} />
                            <Route path="/account" render={props => <Account {...this.props} />}  />
                            <Route path="/support" component={Support} />
                            <Route render={props => <App {...this.props} />} />
                        </Switch>
                    </Segment>
                </Container>
            </BrowserRouter>
        );
    }
}

export default Exchange(BdexRouter);