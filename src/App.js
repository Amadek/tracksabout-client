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
import QueueTab from './Playing/QueueTab';
import ContainerHeightProvider from './ContainerHeightProvider';
import AlbumImagesCache from './AlbumImagesCache/AlbumImagesCache';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger());
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

    this.state = {
      navBarState: NavBarState.home,
      breadcrumbPath: [new BreadcrumbEntityData({ name: NavBarState.home, entityId: null })],
      loadedEntity: null,
      playingQueue: new PlayingQueue(),
      containerHeightProvider: new ContainerHeightProvider(this._handleContainerHeightChanged.bind(this))
    };

    this._breadcrumbPathGenerator.addToPath(new BreadcrumbNavData(this.state.navBarState));
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
        {this.state.playingQueue.getTrackToPlay() &&
          <PlayBar
            tracksAboutApiClient={this._tracksAboutApiClient}
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
        return <UploadTrackTab tracksAboutApiClient={this._tracksAboutApiClient} containerHeightProvider={this.state.containerHeightProvider} />;

      case NavBarState.search:
        return (
          <SearchTab
            tracksAboutApiClient={this._tracksAboutApiClient}
            containerHeightProvider={this.state.containerHeightProvider}
            onSearchResultLoaded={this.handleEntityLoaded}
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
          />
        );

      case NavBarState.queue:
        return (
          <QueueTab
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
      // this._breadcrumbPathGenerator.clearPath();
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

  _handleTrackDoubleClick (albumTracks) {
    try {
      assert.ok(albumTracks);

      this.state.playingQueue.reset();
      for (const albumTrack of albumTracks) {
        this.state.playingQueue.addToQueue(albumTrack);
      }

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handlePlaySelectedTracks (selectedTracks) {
    try {
      assert.ok(selectedTracks);

      this.state.playingQueue.reset();
      for (const track of selectedTracks) {
        this.state.playingQueue.addToQueue(track);
      }

      this.setState({ playingQueue: this.state.playingQueue });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleQueueSelectedTracks (selectedTracks) {
    try {
      assert.ok(selectedTracks);

      for (const track of selectedTracks) {
        this.state.playingQueue.addToQueue(track);
      }

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

  _handlePlayFromSelectedTrack (selectedTrackId) {
    try {
      assert.ok(selectedTrackId);
      this.state.playingQueue.moveQueue(selectedTrackId);
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
}
