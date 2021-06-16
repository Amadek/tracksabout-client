import React from 'react';
import Navbar from './Navbar/Navbar';
import Breadcrumb from './Breadcrumb';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';
import Logger from './Logger';
import assert from 'assert';
import NavBarState from './Navbar/NavbarState';
import SearchTab from './SearchTab/SearchTab';
import TracksAboutApiClient from './TracksAboutApiClient';
import AlbumTab from './AlbumTab/AlbumTab';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger());
    this.handleNavItemClick = this._handleNavItemClick.bind(this);
    this.handleSearchResultClick = this._handleSearchResultClick.bind(this);

    this.state = {
      navBarState: NavBarState.home,
      searchByIdResult: null
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
        return <SearchTab tracksAboutApiClient={this._tracksAboutApiClient} onSearchResultClick={this.handleSearchResultClick} />;

      case NavBarState.album:
        return <AlbumTab tracksAboutApiClient={this._tracksAboutApiClient} album={this.state.searchByIdResult} />;

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

  async _handleSearchResultClick (searchResultId) {
    try {
      assert.ok(searchResultId);
      this._logger.log(this, 'Search result click ' + searchResultId);

      // TODO ucywilizować ten kod tutaj.
      const searchByIdResult = await this._tracksAboutApiClient.searchById(searchResultId);

      this._logger.log(this, searchByIdResult.searchResult);

      if (searchByIdResult.searchResult.type !== 'album') throw new Error(`Route for ${searchResultId.type} not implemented yet.`);

      this.setState({ navBarState: NavBarState.album, searchByIdResult: searchByIdResult.searchResult });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
