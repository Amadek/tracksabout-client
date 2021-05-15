import React from 'react';

export default class LoadingTrack extends React.Component {
  render () {
    return (
      <div className={'row' + (this.props.showBorder ? ' border-top' : '')}>
        <div className='col-10 p-0 py-3'>
          <div className='fs-5'>{this.props.fileName}</div>
          {this.props.trackParsed &&
            <ul className='my-2 text-secondary'>
              <li>Title: {this.props.track.title}</li>
              <li>Album: {this.props.track.albumName}</li>
              <li>Artist: {this.props.track.artistName}</li>
              <li>Year: {this.props.track.year}</li>
              <li>Mimetype: {this.props.track.mimetype}</li>
            </ul>}
        </div>
        <div className={'col-2 d-flex align-items-center' + (this.props.processingMessage ? '' : ' visually-hidden')}>
          <div className='spinner-border me-3' />
          <strong>{this.props.processingMessage}</strong>
        </div>
      </div>
    );
  }
}
