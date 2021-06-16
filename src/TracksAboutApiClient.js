/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import assert from 'assert';

export default class TracksAboutApiClient {
  constructor (logger) {
    assert.ok(logger); this._logger = logger;
    this._tracksAboutApiUrl = 'https://localhost:4000';
  }

  async parseTrack (file) {
    assert.ok(file);
    this._logger.log(this, 'Validating file started.');

    const formData = new FormData();
    formData.append('tracks', file);

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/track/validate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const validateTrackError = await response.json();
        this._logger.log(this, 'Validating failed:\n' + JSON.stringify(validateTrackError, null, 2));
        return { success: false, message: validateTrackError.message, parsedTrack: validateTrackError.additionalData?.parsedTrack };
      }

      const parsedTrack = await response.json();

      this._logger.log(this, 'Validating completed:\n' + JSON.stringify(parsedTrack, null, 2));
      return { success: true, parsedTrack };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  async uploadTracks (files) {
    assert.ok(files);
    this._logger.log(this, 'Uploading files started.');

    const formData = new FormData();
    for (const file of files) {
      formData.append('tracks', file);
    }

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/track`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const uploadTracksError = await response.json();
        this._logger.log(this, 'Uploading failed:\n' + JSON.stringify(uploadTracksError, null, 2));
        return { success: false, message: uploadTracksError.message };
      }

      this._logger.log(this, 'Uploading files completed.');
      return { success: true };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  async search (searchPhrase) {
    assert.ok(searchPhrase);
    this._logger.log(this, `Searching for phrase: ${searchPhrase} started.`);

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/search/${searchPhrase}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const searchError = await response.json();
        this._logger.log(this, 'Search failed:\n' + JSON.stringify(searchError, null, 2));
        return { success: false, message: searchError.message };
      }

      const searchResults = await response.json();
      this._logger.log(this, `Searching for phrase: ${searchPhrase} completed.`);

      return { success: true, searchResults };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  async searchById (guid) {
    assert.ok(guid);

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/search/id/${guid}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const searchError = await response.json();
        this._logger.log(this, 'Search by Id failed:\n' + JSON.stringify(searchError, null, 2));
        return { success: false, message: searchError.message };
      }

      const searchResult = await response.json();
      this._logger.log(this, `Search by Id: ${guid} completed.`);

      return { success: true, searchResult };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }
}
