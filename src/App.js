import React from 'react';
import Navbar from './Navbar/Navbar';
import Breadcrumb from './Breadcrumb';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';
import Logger from './Logger';
import assert from 'assert';
import NavBarState from './Navbar/NavbarState';
import SearchTab from './SearchTab/SearchTab';
import TracksAboutApiClient from './TracksAboutApiClient';

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
        {this._getTab(this.state.navBarState)}
      </>
    );
  }

  _getTab (navBarState) {
    switch (navBarState) {
      case NavBarState.home:
      case NavBarState.upload:
        return <UploadTrackTab />;

      case NavBarState.search:
        return <SearchTab tracksAboutApiClient={new TracksAboutApiClient(new Logger())} />;

      default:
        throw new Error(`NavBarState not supported: ${navBarState}`);
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
