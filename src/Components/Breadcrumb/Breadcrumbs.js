import React from 'react';
import assert from 'assert';
import Logger from '../../Logic/Logger';
import BreadcrumbNavData from './BreadcrumbNavData';
import BreadcrumbEntityData from './BreadcrumbEntityData';

export default class Breadcrumbs extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.breadcrumbPath);
    assert.ok(this.props.tracksAboutApiClient);
    assert.ok(this.props.onBreadcrumbEntityLoaded);
    assert.ok(this.props.onBreadcrumbNavClick);
    this._logger = new Logger();
    this.handleBreadcrumbClick = this._handleBreadcrumbClick.bind(this);

    this.state = {
      searchByIDErrorMessage: ''
    };
  }

  render () {
    return (
      <div className='bg-light px-3 py-2 border-bottom'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb m-0'>
            {this._generateBreadcrumbs()}
          </ol>
        </nav>
        {this.state.searchByIDErrorMessage}
      </div>
    );
  }

  _generateBreadcrumbs () {
    // Add all breadcrumbs without last. Safe for empty array.
    let breadcrumbs = this.props.breadcrumbPath.slice(0, -1).map((breadcrumb, index) =>
      <li
        className='breadcrumb-item text-primary'
        key={index}
      >
        <span role='button' onClick={() => this.handleBreadcrumbClick(breadcrumb)}>{breadcrumb.name}</span>
      </li>
    );

    // Add last breadcrumb. Safe for empty array.
    breadcrumbs = breadcrumbs.concat(this.props.breadcrumbPath.slice(-1).map(breadcrumb =>
      <li
        className='breadcrumb-item active' aria-current='page'
        key={breadcrumbs.length}
      >
        {breadcrumb.name}
      </li>
    ));

    return breadcrumbs.length ? breadcrumbs : <span>&nbsp;</span>; // If empty return white symbol for proper div height.
  }

  /**
   * @param {import('./IBreadcrumbData').default} breadcrumbData
   */
  async _handleBreadcrumbClick (breadcrumbData) {
    try {
      assert.ok(breadcrumbData);

      if (breadcrumbData instanceof BreadcrumbNavData) {
        this.props.onBreadcrumbNavClick(breadcrumbData.navbarState);
        return;
      }

      if (!(breadcrumbData instanceof BreadcrumbEntityData)) return;

      let searchByIdResult = await this.props.tracksAboutApiClient.searchById(breadcrumbData.entityId);
      if (!searchByIdResult.success) {
        this._logger.log(this, 'Search entity by breadcrumb entity id failed. ' + searchByIdResult.message);
        this.setState({ searchByIDErrorMessage: searchByIdResult.message });
        return;
      }

      if (searchByIdResult.obj.type === 'track') {
        searchByIdResult = await this.props.tracksAboutApiClient.searchById(searchByIdResult.obj.albumId);
      }

      this.props.onBreadcrumbEntityLoaded(searchByIdResult.obj);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
