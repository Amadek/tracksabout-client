import React from 'react';
import Navbar from './Navbar/Navbar';
import Breadcrumb from './Breadcrumb';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';
import Logger from './Logger';
import assert from 'assert';
import NavBarState from './Navbar/NavbarState';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this.handleNavItemClick = this._handleNavItemClick.bind(this);

    this.state = {
      navBarState: NavBarState.home
    };
  }

  render () {
    return (
      <>
        <Navbar onNavItemClick={this.handleNavItemClick} />
        <Breadcrumb />
        {this.getTab(this.state.navBarState)}
      </>
    );
  }

  getTab (navBarState) {
    switch (navBarState) {
      case NavBarState.home:
      case NavBarState.upload:
        return <UploadTrackTab />;

      case NavBarState.search:
        return <p>SEARCH</p>;
    }
  }

  _handleNavItemClick (navBarState) {
    try {
      assert.ok(navBarState);
      this.setState({ navBarState });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
