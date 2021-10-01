import React from 'react';
import Navbar from './Navbar/Navbar';
import Breadcrumbs from './Breadcrumb/Breadcrumbs';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';
import Logger from './Logger';
import assert from 'assert';
import NavBarState from './Navbar/NavbarState';
import SearchTab from './SearchTab/SearchTab';
import TracksAboutApiClient from './TracksAboutApiClient';
import AlbumTab from './AlbumTab/AlbumTab';
import ArtistTab from './ArtistTab/ArtistTab';
import BreadcrumbPathGenerator from './Breadcrumb/BreadcrumbPathGenerator';
import BreadcrumbEntityData from './Breadcrumb/BreadcrumbEntityData';
import BreadcrumbNavData from './Breadcrumb/BreadcrumbNavData';
import PlayBar from './PlayBar';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger());
    this._breadcrumbPathGenerator = new BreadcrumbPathGenerator();
    this.handleNavItemClick = this._handleNavItemClick.bind(this);
    this.handleEntityLoaded = this._handleEntityLoaded.bind(this);
    this.handleTrackDoubleClick = this._handleTrackDoubleClick.bind(this);

    this.state = {
      navBarState: NavBarState.home,
      breadcrumbPath: [new BreadcrumbEntityData({ name: NavBarState.home, entityId: null })],
      loadedEntity: null,
      doubleClickedTrackId: null
    };
  }

  render () {
    return (
      <>
        <Navbar onNavItemClick={this.handleNavItemClick} />
        <Breadcrumbs
          tracksAboutApiClient={this._tracksAboutApiClient} breadcrumbPath={this.state.breadcrumbPath}
          onBreadcrumbEntityLoaded={this.handleEntityLoaded} onBreadcrumbNavClick={this.handleNavItemClick}
        />
        {this._getTab(this.state.navBarState)}
        {this.state.doubleClickedTrackId && <PlayBar tracksAboutApiClient={this._tracksAboutApiClient} trackToPlayId={this.state.doubleClickedTrackId} />}
      </>
    );
  }

  _getTab (navBarState) {
    switch (navBarState) {
      case NavBarState.home:
      case NavBarState.upload:
        return <UploadTrackTab />;

      case NavBarState.search:
        return <SearchTab tracksAboutApiClient={this._tracksAboutApiClient} onSearchResultLoaded={this.handleEntityLoaded} />;

      case NavBarState.album:
        return <AlbumTab tracksAboutApiClient={this._tracksAboutApiClient} album={this.state.loadedEntity} onArtistLoaded={this.handleEntityLoaded} onTrackDoubleClick={this.handleTrackDoubleClick} />;

      case NavBarState.artist:
        return <ArtistTab tracksAboutApiClient={this._tracksAboutApiClient} artist={this.state.loadedEntity} onAlbumLoaded={this.handleEntityLoaded} />;

      default:
        throw new Error(`NavBarState not supported: ${navBarState}`);
    }
  }

  _handleNavItemClick (navBarState) {
    try {
      assert.ok(navBarState);

      const breadcrumbData = new BreadcrumbNavData(navBarState);
      this._breadcrumbPathGenerator.clearPath();
      const breadcrumbPath = this._breadcrumbPathGenerator.addToPath(breadcrumbData);

      this.setState({ navBarState, breadcrumbPath });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  /**
   * Based on loaded entity (album or artist) routes to specific tab.
   * @param {*} entity
   */
  _handleEntityLoaded (entity) {
    try {
      const navBarState = this._getNavBarState(entity.type);
      this._logger.log(this, `Route to ${navBarState} tab.`);

      const breadcrumbData = new BreadcrumbEntityData({ name: entity.name, entityId: entity._id });
      const breadcrumbPath = this._breadcrumbPathGenerator.addToPath(breadcrumbData);

      this.setState({ navBarState, breadcrumbPath, loadedEntity: entity });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _getNavBarState (entityType) {
    switch (entityType) {
      case 'artist': return NavBarState.artist;
      case 'album': return NavBarState.album;
      case 'track': return NavBarState.album;
      default: throw new Error(`NavBarState for ${entityType} is not implemented.`);
    }
  }

  _handleTrackDoubleClick (trackId) {
    try {
      assert.ok(trackId);
      this.setState({ doubleClickedTrackId: trackId });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
