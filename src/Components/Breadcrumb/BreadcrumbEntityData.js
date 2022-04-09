import assert from 'assert';
import IBreadcrumbData from './IBreadcrumbData';

export default class BreadcrumbEntityData extends IBreadcrumbData {
  get name () { return this._name; }
  get entityId () { return this._entityId; }

  constructor ({ name, entityId }) {
    super();
    assert.ok(name); this._name = name;
    this._entityId = entityId;
  }
}
