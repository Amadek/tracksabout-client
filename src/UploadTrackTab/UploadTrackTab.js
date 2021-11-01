import React from 'react';
import Logger from '../Logger';
import LoadingTrack from './LoadingTrack';
import FileBox from './FileBox';
import ProcessTracksButton from './ProcessTracksButton';
import TracksAboutApiClient from '../TracksAboutApiClient';
import assert from 'assert';
import TrackState from './TrackState';
import Alert from '../Alert';

export default class UploadTrackTab extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this._tracksAboutApiClient = new TracksAboutApiClient(new Logger());
    this.handleDropToFileBox = this._handleDropToFileBox.bind(this);
    this.handleFilesChange = this._handleFilesChange.bind(this);
    this.handleUploadButtonClick = this._handleUploadButtonClick.bind(this);
    this.handleFileBoxClick = this._handleFileBoxClick.bind(this);
    this.state = {
      files: [],
      uploadingTracksErrorMessage: '',
      uploadTracksButtonState: TrackState.none
    };
  }

  render () {
    const loadingTracks = this.state.files.map((file, index) =>
      <LoadingTrack
        key={index}
        fileName={file.name}
        showBorder={index !== 0}
        state={file.state}
        track={file.track}
        errorMessage={file.errorMessage}
      />
    );

    return (
      <div className='container' style={{ height: 'calc(100% - 97px - 76px)', overflowY: 'auto' }}>
        {this.state.uploadingTracksErrorMessage && <Alert message={this.state.uploadingTracksErrorMessage} />}
        <input
          type='file' className='visually-hidden' accept='audio/flac'
          multiple ref={fileInput => { this._fileInput = fileInput; }} onChange={this.handleFilesChange}
        />
        <FileBox onFileBoxClick={this.handleFileBoxClick} onDropToFileBox={this.handleDropToFileBox} />
        {loadingTracks}
        <ProcessTracksButton
          onFilesChange={this.handleFilesChange}
          onClick={this.handleUploadButtonClick}
          state={this.state.uploadTracksButtonState}
        />
      </div>
    );
  }

  async _handleDropToFileBox (event) {
    try {
      event.preventDefault();
      await this._loadTracks(event.dataTransfer.files);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleFilesChange (event) {
    try {
      await this._loadTracks(event.target.files);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _loadTracks (rawFilesArray) {
    assert.ok(rawFilesArray);
    this._logger.log(this, `Files changed, count ${rawFilesArray.length}.`);

    try {
      // rawFilesArray is not a normal array, so we map it.
      const files = [];
      for (const file of rawFilesArray) {
        file.state = TrackState.parsing;
        files.push(file);
      }

      this.setState({ files, uploadTracksButtonState: TrackState.parsing });

      let uploadTracksButtonState = TrackState.parsed;
      for (const file of files) {
        const parseTrackResult = await this._tracksAboutApiClient.parseTrack(file);

        if (!parseTrackResult.success) {
          file.state = TrackState.error;
          file.errorMessage = parseTrackResult.message;
          uploadTracksButtonState = TrackState.error;
          // Even when API returns error, it could parse file to track.
          file.track = parseTrackResult.parsedTrack;
          this.setState({ files });
          continue;
        }

        file.state = TrackState.parsed;
        file.track = parseTrackResult.parsedTrack;
        this.setState({ files });
      }

      this.setState({ uploadTracksButtonState });
    } catch (error) {
      this.setState({ uploadTracksButtonState: TrackState.error });
      throw error;
    }
  }

  async _handleUploadButtonClick (event) {
    try {
      event.preventDefault();
      this._logger.log(this, 'Uploading files...');
      this.setState({ uploadTracksButtonState: TrackState.uploading });

      if (this.state.files.length === 0) throw new Error('No files selected.');

      const uploadTracksResult = await this._tracksAboutApiClient.uploadTracks(this.state.files);
      if (!uploadTracksResult.success) {
        this.setState({ uploadTracksButtonState: TrackState.error, uploadingTracksErrorMessage: uploadTracksResult.message });
        this._logger.log(this, 'Files upload fail.');
        return;
      }

      this.setState({ uploadTracksButtonState: TrackState.uploaded, uploadingTracksErrorMessage: '' });
      this._logger.log(this, 'Files upload success.');
    } catch (error) {
      this.setState({ uploadTracksButtonState: TrackState.error, uploadingTracksErrorMessage: error.message });
      this._logger.log(this, 'Files upload fail.\n' + error);
    }
  }

  _handleFileBoxClick () {
    try {
      if (!this._fileInput) throw new Error('File input reference not set.');
      this._fileInput.click();
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
