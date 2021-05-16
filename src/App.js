import React from 'react';
import Logger from './Logger';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import LoadingTrack from './LoadingTrack';
import FileBox from './FileBox';
import ProcessTracksButton from './ProcessTracksButton';
import TracksAboutApiClient from './TracksAboutApiClient';
import assert from 'assert';

export default class App extends React.Component {
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
      isSubmitDisabled: false,
      uploadingTracksErrorMessage: ''
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
      <>
        <Navbar />
        <div className='container'>
          {this.state.uploadingTracksErrorMessage &&
            <div className='row'>
              <div className='alert alert-danger m-0 mt-3'>{this.state.uploadingTracksErrorMessage}</div>
            </div>}
          <input
            type='file' className='visually-hidden' accept='audio/flac'
            multiple ref={fileInput => { this._fileInput = fileInput; }} onChange={this.handleFilesChange}
          />
          <FileBox onFileBoxClick={this.handleFileBoxClick} onDropToFileBox={this.handleDropToFileBox} />
          {loadingTracks}
          <ProcessTracksButton
            onFilesChange={this.handleFilesChange}
            onProcessTracksButtonClick={this.handleUploadButtonClick}
            processTracksButtonDisabled={this.state.isSubmitDisabled}
            errorOccured={this.state.submitErrorOccured}
          />
        </div>
      </>
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

    // rawFilesArray is not a normal array, so we map it.
    const files = [];
    for (const file of rawFilesArray) {
      file.state = 'parsing';
      files.push(file);
    }

    this.setState({ files });

    let isSubmitDisabled = false;
    let submitErrorOccured = false;

    for (const file of files) {
      const parseTrackResult = await this._tracksAboutApiClient.parseTrack(file);

      if (!parseTrackResult.success) {
        file.state = 'error';
        file.errorMessage = parseTrackResult.message;
        // Even when API returns error, it could parse file to track.
        file.track = parseTrackResult.parsedTrack;
        this.setState({ files });

        isSubmitDisabled = true;
        submitErrorOccured = true;
        continue;
      }

      file.state = 'parsed';
      file.track = parseTrackResult.parsedTrack;
      this.setState({ files });
    }

    this.setState({ isSubmitDisabled, submitErrorOccured });
  }

  async _handleUploadButtonClick (event) {
    try {
      event.preventDefault();
      this._logger.log(this, 'Uploading files...');
      this.setState({ isSubmitDisabled: true });

      if (this.state.files.length === 0) throw new Error('No files selected.');

      const uploadTracksResult = await this._tracksAboutApiClient.uploadTracks(this.state.files);
      if (!uploadTracksResult.success) {
        this.setState({ uploadingTracksErrorMessage: uploadTracksResult.message });
        this._logger.log(this, 'Files upload fail.');
        return;
      }

      this.setState({ uploadingTracksErrorMessage: '' });
      this._logger.log(this, 'Files upload success.');
    } catch (error) {
      this.setState({ uploadingTracksErrorMessage: error.message });
      this._logger.log(this, 'Files upload fail.\n' + error);
    } finally {
      this.setState({ isSubmitDisabled: false });
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
