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
import PlayBar from './Playing/PlayBar';
import PlayingQueue from './Playing/PlayingQueue';

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
      playingQueue: null
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
        {this.state.playingQueue && <PlayBar tracksAboutApiClient={this._tracksAboutApiClient} playingQueue={this.state.playingQueue} />}
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

  _handleTrackDoubleClick (track, albumTracks) {
    try {
      assert.ok(track);
      assert.ok(albumTracks);

      const playingQueue = new PlayingQueue();
      for (const albumTrack of albumTracks) {
        playingQueue.addToQueue(albumTrack);
      }

      this.setState({ playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
