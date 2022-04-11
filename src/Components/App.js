import React from 'react';
import Navbar from './Navbar/Navbar';
import Breadcrumbs from './Breadcrumb/Breadcrumbs';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';
import Logger from '../Logic/Logger';
import assert from 'assert';
import NavBarState from './Navbar/NavbarState';
import SearchTab from './SearchTab/SearchTab';
import TracksAboutApiClient from '../Logic/TracksAboutApiClient';
import AlbumTab from './AlbumTab';
import ArtistTab from './ArtistTab';
import BreadcrumbPathGenerator from './Breadcrumb/BreadcrumbPathGenerator';
import BreadcrumbEntityData from './Breadcrumb/BreadcrumbEntityData';
import BreadcrumbNavData from './Breadcrumb/BreadcrumbNavData';
import PlayBar from './PlayBar/PlayBar';
import PlayingQueue from '../Logic/PlayingQueue';
import QueueTab from './QueueTab';
import ContainerHeightProvider from '../Logic/ContainerHeightProvider';
import AlbumImagesCache from '../Logic/AlbumImagesCache';
import LoadingSite from './LoadingSite';
import Config from '../Config';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger(), new Config());
    this._breadcrumbPathGenerator = new BreadcrumbPathGenerator();
    this._albumImagesCache = new AlbumImagesCache(this._tracksAboutApiClient);
    this.handleNavItemClick = this._handleNavItemClick.bind(this);
    this.handleEntityLoaded = this._handleEntityLoaded.bind(this);
    this.handleTrackDoubleClick = this._handleTrackDoubleClick.bind(this);
    this.handlePlaySelectedTracks = this._handlePlaySelectedTracks.bind(this);
    this.handleQueueSelectedTracks = this._handleQueueSelectedTracks.bind(this);
    this.handleRemoveSelectedTracks = this._handleRemoveSelectedTracks.bind(this);
    this.handlePlayBarChanged = this._handlePlayBarChanged.bind(this);
    this.handlePlayFromSelectedTrack = this._handlePlayFromSelectedTrack.bind(this);
    this.handleArtistRemoved = this._handleArtistRemoved.bind(this);
    this.handleDeletingSelectedTrack = this._handleDeletingSelectedTrack.bind(this);
    this.handleGetUserError = this._handleGetUserError.bind(this);

    this.state = {
      navBarState: NavBarState.home,
      breadcrumbPath: [new BreadcrumbEntityData({ name: NavBarState.home, entityId: null })],
      loadedEntity: null,
      playingQueue: new PlayingQueue(),
      containerHeightProvider: new ContainerHeightProvider(this._handleContainerHeightChanged.bind(this)),
      getUserErrorMessage: '',
      searchTabMessage: '',
      message: ''
    };

    this._breadcrumbPathGenerator.addToPath(new BreadcrumbNavData(this.state.navBarState));
  }

  render () {
    if (this.state.getUserErrorMessage) {
      return <h1>{this.state.getUserErrorMessage}</h1>;
    }

    const authResult = this._tracksAboutApiClient.auth();
    if (authResult.redirect) {
      return <LoadingSite />;
    }

    return (
      <>
        <Navbar tracksAboutApiClient={this._tracksAboutApiClient} onNavItemClick={this.handleNavItemClick} onGetUserError={this.handleGetUserError} />
        <Breadcrumbs
          tracksAboutApiClient={this._tracksAboutApiClient} breadcrumbPath={this.state.breadcrumbPath}
          onBreadcrumbEntityLoaded={this.handleEntityLoaded} onBreadcrumbNavClick={this.handleNavItemClick}
        />
        {this._getTab(this.state.navBarState)}
        {this.state.playingQueue.getTrackToPlay() &&
          <PlayBar
            tracksAboutApiClient={this._tracksAboutApiClient}
            albumImagesCache={this._albumImagesCache}
            containerHeightProvider={this.state.containerHeightProvider}
            playingQueue={this.state.playingQueue}
            onPlayBarChanged={this.handlePlayBarChanged}
          />}
      </>
    );
  }

  _getTab (navBarState) {
    switch (navBarState) {
      case NavBarState.home:
      case NavBarState.upload:
        return (
          <UploadTrackTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            containerHeightProvider={this.state.containerHeightProvider}
          />
        );

      case NavBarState.search:
        return (
          <SearchTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            containerHeightProvider={this.state.containerHeightProvider}
            albumImagesCache={this._albumImagesCache}
            onSearchResultLoaded={this.handleEntityLoaded}
            searchTabMessage={this.state.searchTabMessage}
          />
        );

      case NavBarState.album:
        return (
          <AlbumTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            containerHeightProvider={this.state.containerHeightProvider}
            albumImagesCache={this._albumImagesCache}
            album={this.state.loadedEntity}
            onArtistLoaded={this.handleEntityLoaded}
            onTrackDoubleClick={this.handleTrackDoubleClick}
            onPlaySelectedTracks={this.handlePlaySelectedTracks}
            onQueueSelectedTracks={this.handleQueueSelectedTracks}
            onDeletingSelectedTrack={this.handleDeletingSelectedTrack}
            onArtistRemoved={this.handleArtistRemoved}
          />
        );

      case NavBarState.artist:
        return (
          <ArtistTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            containerHeightProvider={this.state.containerHeightProvider}
            albumImagesCache={this._albumImagesCache}
            artist={this.state.loadedEntity}
            onAlbumLoaded={this.handleEntityLoaded}
            onDeletingSelectedTrack={this.handleDeletingSelectedTrack}
            message={this.state.message}
          />
        );

      case NavBarState.queue:
        return (
          <QueueTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            playingQueue={this.state.playingQueue}
            containerHeightProvider={this.state.containerHeightProvider}
            albumImagesCache={this._albumImagesCache}
            onRemoveSelectedTracks={this.handleRemoveSelectedTracks}
            onPlayFromSelectedTrack={this.handlePlayFromSelectedTrack}
          />
        );

      default:
        throw new Error(`NavBarState not supported: ${navBarState}`);
    }
  }

  _handleNavItemClick (navBarState) {
    try {
      assert.ok(navBarState);

      const breadcrumbData = new BreadcrumbNavData(navBarState);
      const breadcrumbPath = this._breadcrumbPathGenerator.addToPath(breadcrumbData);

      this.setState({ navBarState, breadcrumbPath, searchTabMessage: '' });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  /**
   * Based on loaded entity (album or artist) routes to specific tab.
   * @param {*} entity
   * @param {string} message
   */
  _handleEntityLoaded (entity, message) {
    try {
      const navBarState = this._getNavBarState(entity.type);
      this._logger.log(this, `Route to ${navBarState} tab.`);

      const breadcrumbData = new BreadcrumbEntityData({ name: entity.name, entityId: entity._id });
      const breadcrumbPath = this._breadcrumbPathGenerator.addToPath(breadcrumbData);

      this.setState({ navBarState, breadcrumbPath, loadedEntity: entity, message });
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

  _handleTrackDoubleClick (track) {
    try {
      assert.ok(track);
      this.state.playingQueue.reset();
      this.state.playingQueue.addMultipleToQueue([track]);

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handlePlaySelectedTracks (selectedTracks) {
    try {
      assert.ok(selectedTracks);

      this.state.playingQueue.reset();
      this.state.playingQueue.addMultipleToQueue(selectedTracks);

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleQueueSelectedTracks (selectedTracks) {
    try {
      assert.ok(selectedTracks);

      this.state.playingQueue.addMultipleToQueue(selectedTracks);

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleRemoveSelectedTracks (selectedTrackIds) {
    try {
      assert.ok(selectedTrackIds);

      for (const trackId of selectedTrackIds) {
        this.state.playingQueue.removeFromQueue(trackId);
      }

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleDeletingSelectedTrack (selectedTrackId) {
    try {
      assert.ok(selectedTrackId);

      if (this.state.playingQueue.getTrackToPlay()) this.state.playingQueue.removeFromQueue(selectedTrackId);

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handlePlayFromSelectedTrack (track) {
    try {
      assert.ok(track);
      this.state.playingQueue.moveQueue(track._id);
      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handlePlayBarChanged (playingQueue) {
    try {
      assert.ok(playingQueue);
      // We only need to refresh.
      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleContainerHeightChanged () {
    try {
      // We only need to refresh.
      this.setState({ containerHeightProvider: this.state.containerHeightProvider });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleArtistRemoved (message) {
    try {
      const breadcrumbData = new BreadcrumbNavData(NavBarState.search);
      const breadcrumbPath = this._breadcrumbPathGenerator.addToPath(breadcrumbData);

      this.setState({ navBarState: NavBarState.search, breadcrumbPath, searchTabMessage: message });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleGetUserError (errorMessage) {
    try {
      assert.ok(typeof errorMessage === 'string');
      this.setState({ getUserErrorMessage: errorMessage });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
