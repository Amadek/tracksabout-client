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
    this.handleFilesChange = this._handleFilesChange.bind(this);
    this.handleUploadButtonClick = this._handleUploadButtonClick.bind(this);
    this.handleFileBoxClick = this._handleFileBoxClick.bind(this);
    this._files = [];
    this.state = { isSubmitDisabled: false, loadingTracks: [] };
  }

  render () {
    return (
      <>
        <Navbar />
        <div className='container'>
          <FileBox onFileBoxClick={this.handleFileBoxClick} />
          {this.state.loadingTracks}
          <ProcessTracksButton fileInputRef={fileInput => { this._fileInput = fileInput; }} onFilesChange={this.handleFilesChange} onProcessTracksButtonClick={this.handleUploadButtonClick} />
        </div>
      </>
    );
  }

  _handleFilesChange (event) {
    this._files = event.target.files;
    this._logger.log(this, `Files changed, count ${this._files.length}.`);

    const loadingTracks = [];
    for (let fileIndex = 0; fileIndex < this._files.length; fileIndex++) {
      const loadingTrack = <LoadingTrack key={fileIndex} fileName={this._files[fileIndex].name} showBorder={fileIndex !== 0} />;
      loadingTracks.push(loadingTrack);
    }

    this.setState({ loadingTracks });
  }

  async _handleUploadButtonClick (event) {
    event.preventDefault();

    try {
      this._logger.log(this, 'Uploading files...');
      this.setState({ isSubmitDisabled: true });

      if (this._files.length === 0) throw new Error('No files selected.');

      const formData = new FormData();
      for (let fileIndex = 0; fileIndex < this._files.length; fileIndex++) {
        formData.append('tracks', this._files[fileIndex]);
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
