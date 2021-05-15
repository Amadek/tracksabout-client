import React from 'react';

export default class LoadingTrack extends React.Component {
  constructor () {
    super();
    this._stateMessages = {
      parsing: 'Parsing...',
      parsed: 'Parsed',
      error: 'Error'
    };
    this._stateTextStyle = {
      parsing: 'text-dark',
      parsed: 'text-success',
      error: 'text-danger'
    };
  }

  render () {
    return (
      <div className={'row' + (this.props.showBorder ? ' border-top' : '')}>
        <div className='col-10 p-0 py-3'>
          <div className='fs-5'>{this.props.fileName}</div>
          {this.props.track &&
            <ul className='my-2 text-secondary'>
              <li>Title: {this.props.track.title}</li>
              <li>Album: {this.props.track.albumName}</li>
              <li>Artist: {this.props.track.artistName}</li>
              <li>Year: {this.props.track.year}</li>
              <li>Mimetype: {this.props.track.mimetype}</li>
            </ul>}
          {this.props.state === 'error' &&
            <p className='text-danger mt-2'>{this.props.errorMessage}</p>}
          {this.props.errorOccured}
        </div>
        <div className='col-2 d-flex align-items-center '>
          <div className={'spinner-border me-3' + (this._checkIfSpinnerShouldBeShown() ? '' : ' visually-hidden')} />
          <strong className={this._stateTextStyle[this.props.state]}>{this._stateMessages[this.props.state]}</strong>
        </div>
      </div>
    );
  }

  _checkIfSpinnerShouldBeShown () {
    return this.props.state === 'parsing';
  }
}
