/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import React from 'react';
import Logger from './Logger';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import LoadingTrack from './LoadingTrack';
import FileBox from './FileBox';
import ProcessTracksButton from './ProcessTracksButton';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this.handleDropToFileBox = this._handleDropToFileBox.bind(this);
    this.handleFilesChange = this._handleFilesChange.bind(this);
    this.handleUploadButtonClick = this._handleUploadButtonClick.bind(this);
    this.handleFileBoxClick = this._handleFileBoxClick.bind(this);
    this.state = { files: [], isSubmitDisabled: false };
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

      const formData = new FormData();
      for (let fileIndex = 0; fileIndex < this.state.files.length; fileIndex++) {
        formData.append('tracks', this.state.files[fileIndex]);
      }

      const response = await fetch('http://localhost:4000/track', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(response.statusText);

      this._logger.log(this, 'Files uploaded.');
    } catch (error) {
      this._logger.log(this, error);
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
