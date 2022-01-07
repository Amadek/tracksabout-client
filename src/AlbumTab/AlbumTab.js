import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';
import TracksTable from '../TracksTable';
import ContainerHeightProvider from '../ContainerHeightProvider';
import TracksAboutApiClient from '../TracksAboutApiClient';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';
import DynamicAlbumCoverImage from '../AlbumCoverImage/DynamicAlbumCoverImage';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    assert.ok(props.tracksAboutApiClient instanceof TracksAboutApiClient);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    assert.ok(props.onTrackDoubleClick);
    assert.ok(props.onPlaySelectedTracks);
    assert.ok(props.onQueueSelectedTracks);
    assert.ok(props.onArtistRemoved);
    assert.ok(props.onDeletingSelectedTrack);
    assert.ok(props.album?.tracks);
    this._logger = new Logger();

    this.albumImg = React.createRef();
    this.handleArtistClick = this._handleArtistClick.bind(this);
    this.handlePlaySelectedTracks = this._handlePlaySelectedTracks.bind(this);
    this.handleQueueSelectedTracks = this._handleQueueSelectedTracks.bind(this);
    this.handleDeleteSelectedTrack = this._handleDeleteSelectedTrack.bind(this);

    this.state = {
      errorMessage: null,
      message: null,
      tracks: this.props.album.tracks.sort((trackA, trackB) => trackA.number - trackB.number),
      selectedTracks: []
    };
  }

  render () {
    return (
      <div className='container-fluid' style={{ ...this.props.containerHeightProvider.provideStyles() }}>
        <div className='row' style={{ height: '100%' }}>
          <div className='col-2 p-3 bg-light border-end' style={{ height: '100%', overflowY: 'auto' }}>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.album.name}</li>
              <li className='text-secondary' role='button' onClick={this.handleArtistClick}>{this.props.album.artistName}</li>
              <li className='text-secondary'>{this.props.album.year}</li>
            </ul>
            <button
              onClick={() => this.handlePlaySelectedTracks([])}
              type='button' className='btn btn-outline-dark p-1' style={{ width: '100%', borderRadius: 0 }}
            >Play
            </button>
            <div className='mt-3'>
              <DynamicAlbumCoverImage albumId={this.props.album._id} albumImagesCache={this.props.albumImagesCache} />
            </div>
          </div>
          <div className='col-10 p-0' style={{ height: '100%', overflowY: 'auto' }}>
            {this.state.errorMessage && <Alert message={this.state.errorMessage} className='mt-3 mx-3 mb-2' />}
            {this.state.message && <Alert message={this.state.message} alertType='alert-success' className='mt-3 mx-3 mb-2' />}
            <TracksTable
              tracks={this.state.tracks}
              tracksAboutApiClient={this.props.tracksAboutApiClient}
              onTrackDoubleClick={this.props.onTrackDoubleClick}
              onPlaySelectedTracks={this.handlePlaySelectedTracks}
              onQueueSelectedTracks={this.handleQueueSelectedTracks}
              onDeleteSelectedTrack={this.handleDeleteSelectedTrack}
            />
          </div>
        </div>
      </div>
    );
  }

  _handlePlaySelectedTracks (selectedTrackIds) {
    try {
      assert.ok(selectedTrackIds);
      const selectedTracks = selectedTrackIds.length === 0
        ? this.state.tracks
        : this.state.tracks.filter(track => selectedTrackIds.some(trackId => trackId === track._id));

      this.props.onPlaySelectedTracks(selectedTracks);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleQueueSelectedTracks (selectedTrackIds) {
    try {
      assert.ok(selectedTrackIds);
      const selectedTracks = this.state.tracks.filter(track => selectedTrackIds.some(trackId => trackId === track._id));

      this.props.onQueueSelectedTracks(selectedTracks);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleDeleteSelectedTrack (selectedTrackId) {
    try {
      assert.ok(selectedTrackId);

      this.props.onDeletingSelectedTrack(selectedTrackId);

      const removeTrackResult = await this.props.tracksAboutApiClient.removeTrack(selectedTrackId);
      if (!removeTrackResult.success) {
        this._logger.log(this, `Remove track failed.\n${removeTrackResult.message}`);
        this.setState({ errorMessage: removeTrackResult.message });
        return;
      }

      if (removeTrackResult.deletedObjectType === 'artist') {
        this.props.onArtistRemoved(`Artist ${this.props.album.artistName} removed successfully.`);
        return;
      }

      if (removeTrackResult.deletedObjectType === 'album') {
        const searchArtistResult = await this.props.tracksAboutApiClient.searchById(this.props.album.artistId);
        if (!searchArtistResult.success) {
          this._logger.log(this, `Search artist by Id failed.\n${searchArtistResult.message}`);
          this.setState({ errorMessage: searchArtistResult.message });
          return;
        }

        this.props.onArtistLoaded(searchArtistResult.obj, `Album ${this.props.album.name} removed successfully.`);
        return;
      }

      if (removeTrackResult.deletedObjectType === 'track') {
        const searchByIdResult = await this.props.tracksAboutApiClient.searchById(this.props.album._id);
        if (!searchByIdResult.success) {
          this._logger.log(this, 'Search album by Id failed.');
          this.setState({ errorMessage: searchByIdResult.message });
          return;
        }

        const album = searchByIdResult.obj;
        const removedTrack = this.props.album.tracks.find(t => t._id === selectedTrackId);
        this.setState({ tracks: album.tracks.sort((trackA, trackB) => trackA.number - trackB.number), message: `Track ${removedTrack.title} deleted successfully.` });
        return;
      }

      throw new Error('Unsupported deleted object type: ' + removeTrackResult.deletedObjectType);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleArtistClick () {
    try {
      const searchArtistResult = await this.props.tracksAboutApiClient.searchById(this.props.album.artistId);
      if (!searchArtistResult.success) {
        this._logger.log(this, `Search artist by Id failed.\n${searchArtistResult.message}`);
        this.setState({ errorMessage: searchArtistResult.message });
        return;
      }

      this.props.onArtistLoaded(searchArtistResult.obj);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
