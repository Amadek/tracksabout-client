/* global FormData, fetch */
/* eslint no-redeclare: 'off' */
import assert from 'assert';

export default class TracksAboutApiClient {
  constructor (logger) {
    assert.ok(logger); this._logger = logger;
    this._tracksAboutApiUrl = 'http://localhost:4000';
  }

  async uploadTracks (files) {
    assert.ok(files);

    const formData = new FormData();
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      formData.append('tracks', files[fileIndex]);
    }

    try {
      const response = await fetch(`${this._tracksAboutApiUrl}/track`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(response.statusText);
      return { success: true };
    } catch (error) {
      this._logger.log(this, error);
      return { success: false, message: error.message };
    }
  }
}