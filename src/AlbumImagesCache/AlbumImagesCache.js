import assert from 'assert';
import TracksAboutApiClient from '../TracksAboutApiClient';

export default class AlbumImagesCache {
  /**
   * @param {TracksAboutApiClient} tracksAboutApiClient
   */
  constructor (tracksAboutApiClient) {
    assert.ok(tracksAboutApiClient instanceof TracksAboutApiClient); this._tracksAboutApiClient = tracksAboutApiClient;
    // Dictionary album Id -> album image with base64 data and format.
    this._albumImages = {};
  }

  async getAlbumCover (trackId, albumId) {
    assert.ok(trackId);
    assert.ok(albumId);

    if (this._albumImages[albumId]) return this._albumImages[albumId];

    const getTrackCoverResult = await this._tracksAboutApiClient.getTrackCover(trackId);
    if (!getTrackCoverResult.success) throw new Error(getTrackCoverResult.message);

    this._albumImages[albumId] = getTrackCoverResult.trackCover;
    return this._albumImages[albumId];
  }
}
