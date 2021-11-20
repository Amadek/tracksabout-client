/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import assert from 'assert';

export default class TracksAboutApiClient {
  constructor (logger) {
    assert.ok(logger); this._logger = logger;
    this._tracksAboutApiUrl = 'https://localhost:4000';
    this._jwt = null;
  }

  async auth () {
    try {
      // If we already have JWT token, we are done.
      if (this._jwt) return;

      // If user come from auth redirect, we save JWT token fom URL to memory.
      // Otherwise we redirect to authorize in API which redirect us back with JWT token in query params in URL.
      const locationUrl = new URL(window.location.href);
      if (locationUrl.searchParams.has('jwt')) {
        this._jwt = locationUrl.searchParams.get('jwt');
        return;
      }

      const authUrl = new URL(`${this._tracksAboutApiUrl}/auth`);
      authUrl.searchParams.append('client_id', '0a1f813f4e2156f6e862');
      authUrl.searchParams.append('redirect_url', 'https://localhost:3000');

      window.location.href = authUrl.href;
    } catch (error) {
      this._logger.log(this, error);
    }
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

  async getAlbumCover (albumId) {
    assert.ok(albumId);
    this._logger.log(this, 'Getting cover for album id: ' + albumId);

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/track/cover/${albumId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const getAlbumCoverError = await response.json();
        this._logger.log(this, 'Getting album cover by album failed:\n' + JSON.stringify(getAlbumCoverError, null, 2));
        return { success: false, message: getAlbumCoverError.message };
      }

      const trackCover = await response.json();

      this._logger.log(this, 'Album cover found for album id:' + albumId);
      return { success: true, trackCover };
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
      const searchTrackUrl = new URL(`${this._tracksAboutApiUrl}/search/${searchPhrase}`);
      searchTrackUrl.searchParams.append('jwt', this._jwt);

      const response = await fetch(searchTrackUrl.href, { method: 'GET' });

      if (!response.ok) {
        const searchError = await response.json();
        this._logger.log(this, 'Search failed:\n' + JSON.stringify(searchError, null, 2));
        return { success: false, message: searchError.message };
      }

      const searchResults = await response.json();
      this._logger.log(this, `Searching for phrase: ${searchPhrase} completed. Found: \n ${JSON.stringify(searchResults, null, 2)}`);

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

      const obj = await response.json();
      this._logger.log(this, `Search by Id: ${guid} completed. Found: \n` + JSON.stringify(obj, null, 2));

      return { success: true, obj };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  getStreamTrackUrl (trackId) {
    assert.ok(trackId);
    return `${this._tracksAboutApiUrl}/track/stream/${trackId}`;
  }
}
