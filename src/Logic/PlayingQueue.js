import assert from 'assert';

export default class PlayingQueue {
  get queueStartReached () { return this._queueStartReached; }
  get queueEndReached () { return this._queueEndReached; }
  get queuedTracks () { return this._tracksQueue.slice(); }
  get hash () { return `${this._queueIndexPosition}_${JSON.stringify(this._tracksQueue.map(t => t._id))}`; }

  constructor () {
    this._tracksQueue = [];
    this._queueIndexPosition = 0;
    this._queueStartReached = true;
    this._queueEndReached = true;

    this.onReset = () => {};
  }

  addToQueue (track) {
    this._tracksQueue.push(track);
    if (this._tracksQueue.length > 1) this._queueEndReached = false;
  }

  removeFromQueue (trackId) {
    const trackToRemove = this._tracksQueue.find(t => t._id === trackId);
    assert.ok(trackToRemove);
    const trackToRemoveIndex = this._tracksQueue.indexOf(trackToRemove);
    this._tracksQueue.splice(trackToRemoveIndex, 1);

    if (this._tracksQueue.length === 1) {
      this._queueStartReached = true;
      this._queueEndReached = true;
    }

    // When we remove track after queue position, we have to shift it back.
    const track = trackToRemoveIndex < this._queueIndexPosition
      ? this.getPreviousTrackToPlay()
      : this.getTrackToPlay();

    this._queueStartReached = this._queueIndexPosition === 0;
    this._queueEndReached = this._queueIndexPosition === this._tracksQueue.length - 1;

    return track;
  }

  moveQueue (trackId) {
    const trackToPlay = this._tracksQueue.find(t => t._id === trackId);
    assert.ok(trackToPlay);

    this._queueIndexPosition = this._tracksQueue.indexOf(trackToPlay);
    this._queueStartReached = this._queueIndexPosition === 0;
    this._queueEndReached = this._queueIndexPosition === this._tracksQueue.length - 1;

    return this.getTrackToPlay();
  }

  getTrackToPlay () {
    return this._tracksQueue[this._queueIndexPosition];
  }

  getNextTrackToPlay () {
    this._queueStartReached = false;

    if (this._queueIndexPosition < this._tracksQueue.length - 1) {
      this._queueEndReached = false;
      this._queueIndexPosition++;
    }

    if (this._queueIndexPosition === this._tracksQueue.length - 1) this._queueEndReached = true;

    return this._tracksQueue[this._queueIndexPosition];
  }

  getPreviousTrackToPlay () {
    this._queueEndReached = false;

    if (this._queueIndexPosition > 0) {
      this._queueStartReached = false;
      this._queueIndexPosition--;
    }

    if (this._queueIndexPosition === 0) this._queueStartReached = true;

    return this._tracksQueue[this._queueIndexPosition];
  }

  reset () {
    this._tracksQueue = [];
    this._queueIndexPosition = 0;
    this._queueStartReached = true;
    this._queueEndReached = true;

    this.onReset();
  }
}
