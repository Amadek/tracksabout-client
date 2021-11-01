import assert from 'assert';

export default class AlbumTrack {
  get _id () { return this.__id; }
  get title () { return this._title; }
  get duration () { return this._duration; }
  get index () { return this._index; }
  get albumName () { return this._albumName; }
  get artistName () { return this._artistName; }

  /**
   * @param {object} track
   * @param {number} index
   */
  constructor (track, index) {
    assert.ok(track);
    assert.ok(!Number.isNaN(index)); this._index = index;
    assert.ok(track._id); this.__id = track._id;
    assert.ok(track.title); this._title = track.title;
    assert.ok(track.duration); this._duration = track.duration;
    assert.ok(track.albumName); this._albumName = track.albumName;
    assert.ok(track.artistName); this._artistName = track.artistName;
  }
}
