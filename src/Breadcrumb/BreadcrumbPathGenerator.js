import assert from 'assert';
import Logger from '../Logger';

export default class BreadcrumbPathGenerator {
  constructor () {
    this._path = [];
    this._logger = new Logger();
  }

  /**
   * Adds breadcrumb to path array.
   * @param {import('./IBreadcrumbData').default} breadcrumbData
   * @returns {import('./IBreadcrumbData').default[]} path as array of breadcrumbs data.
   */
  addToPath (breadcrumbData) {
    assert.ok(breadcrumbData);

    if (this._path.find(b => b.name === breadcrumbData.name)) {
      const existingBreadcrumbIndex = this._path.findIndex(b => b.name === breadcrumbData.name);
      this._path = this._path.slice(0, existingBreadcrumbIndex + 1);
      return this._path;
    }

    this._path.push(breadcrumbData);
    return this._path;
  }

  clearPath () {
    this._path = [];
    return this._path;
  }
}