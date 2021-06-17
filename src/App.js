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
import Alert from './Alert';
import ArtistTab from './ArtistTab/ArtistTab';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger());
    this.handleNavItemClick = this._handleNavItemClick.bind(this);
    this.handleSearchResultClick = this._handleSearchResultClick.bind(this);

    this.state = {
      navBarState: NavBarState.home,
      searchByIDErrorMessage: null,
      searchByIdResult: null
    };
  }

  render () {
    return (
      <>
        <Navbar onNavItemClick={this.handleNavItemClick} />
        <Breadcrumb />
        {this.state.searchByIDErrorMessage && <Alert message={this.state.searchByIDErrorMessage} />}
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

      case NavBarState.artist:
        return <ArtistTab tracksAboutApiClient={this._tracksAboutApiClient} artist={this.state.searchByIdResult} onAlbumClick={this.handleSearchResultClick} />;

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
      let searchByIdResult = await this._tracksAboutApiClient.searchById(searchResultId);
      if (!searchByIdResult.success) {
        this._logger.log(this, 'Search by Id failed.');
        this.setState({ searchByIDErrorMessage: searchByIdResult.message });
        return;
      }

      if (searchByIdResult.obj.type === 'track') {
        searchByIdResult = await this._tracksAboutApiClient.searchById(searchByIdResult.obj.albumId);
      }

      const navBarState = this._getNavBarState(searchByIdResult.obj.type);

      this.setState({ navBarState, searchByIdResult: searchByIdResult.obj });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _getNavBarState (searchByIdResultType) {
    switch (searchByIdResultType) {
      case 'artist': return NavBarState.artist;
      case 'album': return NavBarState.album;
      case 'track': return NavBarState.album;
      default: throw new Error(`NavBarState for ${searchByIdResultType} is not implemented.`);
    }
  }
}
