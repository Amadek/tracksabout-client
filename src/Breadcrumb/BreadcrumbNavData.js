import assert from 'assert';
import IBreadcrumbData from './IBreadcrumbData';

export default class BreadcrumbNavData extends IBreadcrumbData {
  get name () { return this._navbarState; }
  get navbarState () { return this._navbarState; }

  /**
   * @param {import('../Navbar/NavbarState').default} navbarState 
   */
  constructor (navbarState) {
    super();
    assert.ok(navbarState); this._navbarState = navbarState;
  }
}
