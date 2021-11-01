import React from 'react';
import NavBarState from './NavbarState';

export default class Navbar extends React.Component {
  render () {
    return (
      <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
        <div className='container-fluid'>
          <span className='navbar-brand' role='button' onClick={() => this.props.onNavItemClick(NavBarState.home)}>TracksAbout</span>
          <button
            className='navbar-toggler' type='button'
            data-bs-toggle='collapse' data-bs-target='#navbarNav'
            aria-controls='navbarNav' aria-expanded='false' aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon' />
          </button>
          <div className='collapse navbar-collapse' id='navbarNav'>
            <div className='navbar-nav'>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.search)}>Search</span>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.upload)}>Upload</span>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.queue)}>Queue</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
