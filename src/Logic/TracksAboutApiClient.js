/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import assert from 'assert';
import Config from '../Config';

export default class TracksAboutApiClient {
  constructor (logger, config) {
    assert.ok(logger); this._logger = logger;
    assert.ok(config instanceof Config);
    this._config = config;
    this._jwt = null;
  }

  auth () {
    try {
      // If we already have JWT token, we are done.
      if (this._jwt) return { redirect: false };

      // If user come from auth redirect, we save JWT token fom URL to memory.
      // Otherwise we redirect to authorize in API which redirect us back with JWT token in query params in URL.
      const locationUrl = new URL(window.location.href);
      if (locationUrl.searchParams.has('jwt')) {
        this._jwt = locationUrl.searchParams.get('jwt');
        return { redirect: false };
      }

      const authUrl = new URL(`${this._config.tracksAboutApiUrl}/auth`);
      // TODO AP to client id też trzeba przenieść do konfiga
      authUrl.searchParams.append('client_id', '0a1f813f4e2156f6e862');
      authUrl.searchParams.append('redirect_url', new URL(window.location.href).origin);

      window.location.href = authUrl.href;
      return { redirect: true };
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async getUser () {
    try {
      const getUserUrl = new URL(`${this._config.tracksAboutApiUrl}/user`);
      getUserUrl.searchParams.append('jwt', this._jwt);

      const response = await fetch(getUserUrl.href, { method: 'GET' });

      if (!response.ok) {
        const getUserError = await response.json();
        this._logger.log(this, 'Getting user failed:\n' + JSON.stringify(getUserError, null, 2));
        return { success: false, message: getUserError.message };
      }

      const user = await response.json();

      this._logger.log(this, 'Getting user completed:\n' + JSON.stringify(user, null, 2));
      return { success: true, user };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  async parseTrack (file) {
    assert.ok(file);
    this._logger.log(this, 'Validating file started.');

    const formData = new FormData();
    formData.append('tracks', file);

    try {
      const response = await fetch(`${this._config.tracksAboutApiUrl}/track/validate`, {
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
      const response = await fetch(`${this._config.tracksAboutApiUrl}/track/cover/${albumId}`, {
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
      const uploadTracksUrl = new URL(`${this._config.tracksAboutApiUrl}/track`);
      uploadTracksUrl.searchParams.append('jwt', this._jwt);

      const response = await fetch(uploadTracksUrl.href, {
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

  async removeTrack (trackId) {
    assert.ok(trackId);

    try {
      const removeTrackUrl = new URL(`${this._config.tracksAboutApiUrl}/track/${trackId}`);
      removeTrackUrl.searchParams.append('jwt', this._jwt);

      const response = await fetch(removeTrackUrl.href, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const removeTrackError = await response.json();
        this._logger.log(this, 'Removing track failed:\n' + JSON.stringify(removeTrackError, null, 2));
        return { success: false, message: removeTrackError.message };
      }

      const removeTrackResult = await response.json();
      this._logger.log(this, `Track ${trackId} removed, deleted object type: ${removeTrackResult.deletedObjectType}.`);
      return { success: true, deletedObjectType: removeTrackResult.deletedObjectType };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }

  async search (searchPhrase) {
    assert.ok(searchPhrase);
    this._logger.log(this, `Searching for phrase: ${searchPhrase} started.`);

    try {
      const searchTrackUrl = new URL(`${this._config.tracksAboutApiUrl}/search/${searchPhrase}`);
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
      const response = await fetch(`${this._config.tracksAboutApiUrl}/search/id/${guid}`, {
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
    return `${this._config.tracksAboutApiUrl}/track/stream/${trackId}`;
  }
}
