import React from 'react';

export default class ProcessTracksButton extends React.Component {
  render () {
    return (
      <div className='row'>
        <div className='col d-grid p-0 pt-2'>
          <button
            type='button' className='btn btn-lg btn-primary'
            disabled={this.props.processTracksButtonDisabled} onClick={this.props.onProcessTracksButtonClick}
          >
            Upload tracks
          </button>
        </div>
      </div>
    );
  }
}
