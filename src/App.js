import React from 'react';
import Logger from './Logger';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import LoadingTrack from './LoadingTrack';
import FileBox from './FileBox';
import ProcessTracksButton from './ProcessTracksButton';
import TracksAboutApiClient from './TracksAboutApiClient';

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
        processingMessage={file.state}
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
          />
        </div>
      </>
    );
  }

  _handleDropToFileBox (event) {
    try {
      event.preventDefault();
      this._loadTracks(event.dataTransfer.files);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleFilesChange (event) {
    try {
      this._loadTracks(event.target.files);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _loadTracks (files) {
    this._logger.log(this, `Files changed, count ${files.length}.`);

    // files is not a normal array, so we map it.
    const filesArray = [];
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      file.state = 'parsing';
      filesArray.push(files[fileIndex]);
    }

    this.setState({ files: filesArray });

    // TODO parsowanie tracków.
  }

  async _handleUploadButtonClick (event) {
    event.preventDefault();

    try {
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
