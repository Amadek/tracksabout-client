/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import React from 'react';
import Logger from './Logger';

export default class App extends React.Component {
  constructor () {
    super();
    this._logger = new Logger();
    this.handleFilesChange = this._handleFilesChange.bind(this);
    this.handleSubmitFiles = this._handleSubmitFiles.bind(this);
    this._files = [];
  }

  render () {
    return (
      <div>
        <p>TracksAbout</p>
        <form onSubmit={this.handleSubmitFiles}>
          <input type='file' multiple onChange={this.handleFilesChange} />
          <input type='submit' />
        </form>
      </div>
    );
  }

  _handleFilesChange (event) {
    this._files = event.target.files;
    this._logger.log(this, `Files changed, count ${this._files.length}.`);
  }

  async _handleSubmitFiles (event) {
    event.preventDefault();

    try {
      this._logger.log(this, 'Uploading files...');
      if (this._files.length === 0) throw new Error('No files selected.');

      const formData = new FormData();
      for (const file in this._files) {
        formData.append('tracks', file);
      }

      await fetch('http://localhost:4000/track', {
        method: 'POST',
        body: formData
      });

      this._logger.log('Files uploaded.');
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
