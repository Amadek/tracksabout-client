import React from 'react';

export default class ProcessTracksButton extends React.Component {
  render () {
    return (
      <div className='row'>
        <div className='col d-grid p-0 pt-2'>
          <input
            type='file' className='visually-hidden' accept='audio/flac'
            multiple ref={this.props.fileInputRef} onChange={this.props.onFilesChange}
          />
          <button
            type='button' className='btn btn-lg btn-primary'
            /* disabled={this.state.isSubmitDisabled} */ onClick={this.props.onProcessTracksButtonClick}
          >
            Upload tracks
          </button>
        </div>
      </div>
    );
  }
}
