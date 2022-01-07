import React from 'react';
import TrackState from './TrackState';

export default class ProcessTracksButton extends React.Component {
  constructor (props) {
    super(props);
    this._buttonColors = this._createButtonColors();
    this._buttonTitles = this._createButtonTitles();
  }

  render () {
    return (
      <div className='row'>
        <div className='col d-grid py-3'>
          <button
            type='button' className={`btn btn-lg ${this._buttonColors[this.props.state]}`}
            style={{ borderRadius: 0 }}
            disabled={[TrackState.none, TrackState.parsing, TrackState.uploading, TrackState.uploaded, TrackState.error].includes(this.props.state)}
            onClick={this.props.onClick}
          >
            {this.props.state === TrackState.uploading &&
              <span className='spinner-border me-2' style={{ width: '1.5rem', height: '1.5rem' }} role='status' aria-hidden='true' />}
            {this._buttonTitles[this.props.state]}
          </button>
        </div>
      </div>
    );
  }

  _createButtonColors () {
    const buttonColors = {
      [TrackState.none]: 'btn-primary',
      [TrackState.parsing]: 'btn-secondary',
      [TrackState.parsed]: 'btn-primary',
      [TrackState.uploading]: 'btn-success',
      [TrackState.uploaded]: 'btn-success',
      [TrackState.error]: 'btn-danger'
    };

    for (const trackState in TrackState) {
      if (!buttonColors[trackState] === undefined) throw new Error(`Not supported track state: ${trackState}`);
    }

    return buttonColors;
  }

  _createButtonTitles () {
    const buttonTitles = {
      [TrackState.none]: 'Upload',
      [TrackState.parsing]: 'Parsing...',
      [TrackState.parsed]: 'Upload',
      [TrackState.uploading]: 'Uploading...',
      [TrackState.uploaded]: 'Uploaded successfully!',
      [TrackState.error]: 'Error occured'
    };

    for (const trackState in TrackState) {
      if (!buttonTitles[trackState] === undefined) throw new Error(`Not supported track state: ${trackState}`);
    }

    return buttonTitles;
  }
}
