import React from 'react';

export default class Breadcrumbs extends React.Component {
  render () {
    return (
      <div className='bg-light px-3 py-2 border-bottom'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb m-0'>
            {this._generateBreadcrumbs()}
          </ol>
        </nav>
      </div>
    );
  }

  _generateBreadcrumbs () {
    // Add all breadcrumbs without last. Safe for empty array.
    let breadcrumbs = this.props.breadcrumbPath.slice(0, -1).map((breadcrumb, index) => 
      <li key={index} className='breadcrumb-item'>{breadcrumb}</li>
    );

    // Add last breadcrumb. Safe for empty array.
    breadcrumbs = breadcrumbs.concat(this.props.breadcrumbPath.slice(-1).map((breadcrumb, index) =>
      <li key={breadcrumbs.length} className='breadcrumb-item active' aria-current='page'>{breadcrumb}</li>
    ));
    
    return breadcrumbs.length ? breadcrumbs : <span>&nbsp;</span>; // If empty return white symbol for proper div height.
  }
}
