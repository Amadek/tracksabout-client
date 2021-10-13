
export default class PlayingQueue {
  get queueStartReached () { return this._queueStartReached; }
  get queueEndReached () { return this._queueEndReached; }

  constructor () {
    this._tracksQueue = [];
    this._queueIndexPosition = 0;
    this._queueStartReached = true;
    this._queueEndReached = true;
  }

  addToQueue (track) {
    if (this._tracksQueue.length > 0) this._queueEndReached = false;
    this._tracksQueue.push(track);
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
}
