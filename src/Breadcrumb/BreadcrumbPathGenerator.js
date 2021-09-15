import assert from 'assert';
import Logger from '../Logger';

export default class BreadcrumbPathGenerator {
  constructor () {
    this._path = [];
    this._logger = new Logger();
  }

  addToPath (breadcrumbData) {
    assert.ok(breadcrumbData);

    if (this._path.indexOf(breadcrumbData.name) !== -1) {
      const existingBreadcrumbIndex = this._path.indexOf(breadcrumbData.name);
      this._path = this._path.slice(0, existingBreadcrumbIndex + 1);
      return this._path;
    }

    this._path.push(breadcrumbData.name);
    return this._path;
  }

  clearPath () {
    this._path = [];
    return this._path;
  }
}