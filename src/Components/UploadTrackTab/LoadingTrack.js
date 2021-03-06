import React from 'react';
import TrackState from './TrackState';
import assert from 'assert';
import StaticAlbumCoverImage from '../AlbumCoverImage/StaticAlbumCoverImage';

export default class LoadingTrack extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.state);
    assert.ok(props.errorMessage || true);
    this._loadingMessages = this._createLoadingMessages();
    this._textColors = this._createTextColors();
  }

  render () {
    return (
      <div className='row'>
        <div className='col-12'>
          <div className={this.props.showBorder ? 'border-top' : ''} />
        </div>
        <div className='col-8 py-3'>
          <div className='fs-5'>{this.props.fileName}</div>
          {this.props.track &&
            <>
              <ul className='m-0 mt-2 text-secondary'>
                <li>no. {this.props.track.number}</li>
                <li>Title: {this.props.track.title}</li>
                <li>Duration: {new Date(0, 0, 1, 0, 0, this.props.track.duration).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</li>
                <li>Album: {this.props.track.albumName}</li>
                <li>Artist: {this.props.track.artistName}</li>
                <li>Year: {this.props.track.year}</li>
                <li>Mimetype: {this.props.track.mimetype}</li>
              </ul>
            </>}
          {this.props.state === TrackState.error &&
            <div className='text-danger mt-2'>{this.props.errorMessage}</div>}
        </div>
        <div className='col-2 d-flex align-items-center'>
          {this.props.track?.albumCover &&
            <div style={{ width: '100%' }}>
              <StaticAlbumCoverImage albumCover={this.props.track.albumCover} />
            </div>}
        </div>
        <div className='col-2 d-flex align-items-center'>
          {this.props.state === TrackState.parsing && <div className='spinner-border me-3' />}
          <strong className={this._textColors[this.props.state]}>{this._loadingMessages[this.props.state]}</strong>
        </div>
      </div>
    );
  }

  _createLoadingMessages () {
    const loadingMessages = {
      [TrackState.none]: '',
      [TrackState.parsing]: 'Parsing...',
      [TrackState.parsed]: 'Parsed',
      [TrackState.uploading]: 'Parsed',
      [TrackState.uploaded]: 'Parsed',
      [TrackState.error]: 'Error'
    };

    for (const trackState in TrackState) {
      if (loadingMessages[trackState] === undefined) throw new Error(`Not supported track state: ${trackState}`);
    }

    return loadingMessages;
  }

  _createTextColors () {
    const textColors = {
      [TrackState.none]: 'text-dark',
      [TrackState.parsing]: 'text-dark',
      [TrackState.parsed]: 'text-success',
      [TrackState.uploading]: 'text-success',
      [TrackState.uploaded]: 'text-success',
      [TrackState.error]: 'text-danger'
    };

    for (const trackState in TrackState) {
      if (!textColors[trackState] === undefined) throw new Error(`Not supported track state: ${trackState}`);
    }

    return textColors;
  }
}
