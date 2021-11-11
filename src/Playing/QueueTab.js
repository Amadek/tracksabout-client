import React from 'react';
import assert from 'assert';
import TracksTable from '../TracksTable';
import Logger from '../Logger';
import PlayingQueue from './PlayingQueue';
import ContainerHeightProvider from '../ContainerHeightProvider';
import DynamicAlbumCoverImage from '../AlbumCoverImage/DynamicAlbumCoverImage';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';

export default class QueueTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.playingQueue instanceof PlayingQueue);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    assert.ok(props.onRemoveSelectedTracks);
    assert.ok(props.onPlayFromSelectedTrack);
    this._logger = new Logger();

    this.handleTrackClick = this._handleTrackClick.bind(this);

    this.state = { clickedTrack: null };
  }

  render () {
    return (
      <div className='container-fluid' style={{ ...this.props.containerHeightProvider.provideStyles() }}>
        <div className='row' style={{ height: '100%' }}>
          <div className='col-2 p-3 bg-light border-end' style={{ height: '100%', overflowY: 'auto' }}>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.state.clickedTrack?.albumName}</li>
              <li className='text-secondary'>{this.state.clickedTrack?.artistName}</li>
              <li className='text-secondary'>{this.state.clickedTrack?.year}</li>
              <li><i>{this.state.clickedTrack?.title}</i></li>
              <li>{this.state.clickedTrack && new Date(0, 0, 1, 0, 0, this.state.clickedTrack.duration).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</li>
            </ul>
            {this.state.clickedTrack && <DynamicAlbumCoverImage albumId={this.state.clickedTrack.albumId} albumImagesCache={this.props.albumImagesCache} />}
          </div>
          <div className='col-10 p-0' style={{ height: '100%', overflowY: 'auto' }}>
            <TracksTable
              tracks={this.props.playingQueue.queuedTracks}
              playingTrackId={this.props.playingQueue.getTrackToPlay()?._id}
              onTrackClick={this.handleTrackClick}
              onRemoveSelectedTracks={this.props.onRemoveSelectedTracks}
              onPlayFromSelectedTrack={this.props.onPlayFromSelectedTrack}
              showAlbumColumn
              showArtistColumn
            />
          </div>
        </div>
      </div>
    );
  }

  _handleTrackClick (clickedTrack) {
    try {
      assert.ok(clickedTrack);
      this.setState({ clickedTrack });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
