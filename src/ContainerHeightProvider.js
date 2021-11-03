import assert from 'assert';

export default class ContainerHeightProvider {
  constructor (onContainerHeightChange) {
    assert.ok(onContainerHeightChange || true); this._onContainerHeightChange = onContainerHeightChange;
    this._navBarHeight = 51;
    this._breadcrumbsHeight = 46;
    this._playBarHeight = 0;
  }

  addPlayBarHeight () {
    this._playBarHeight = 76;
    if (this._onContainerHeightChange) this._onContainerHeightChange();
  }

  removePlayBarHeight () {
    this._playBarHeight = 0;
    if (this._onContainerHeightChange) this._onContainerHeightChange();
  }

  provideStyles () {
    const reservedHeight = this._navBarHeight + this._breadcrumbsHeight + this._playBarHeight;
    return { height: `calc(100% - ${reservedHeight}px)` };
  }
}
