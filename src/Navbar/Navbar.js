import React from 'react';
import NavBarState from './NavbarState';
import assert from 'assert';
import TracksAboutApiClient from '../TracksAboutApiClient';
import Logger from '../Logger';

export default class Navbar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracksAboutApiClient instanceof TracksAboutApiClient);
    assert.ok(this.props.onNavItemClick);
    assert.ok(this.props.onGetUserError);
    this._logger = new Logger();

    this.state = { user: null };
  }

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
            <div className='navbar-nav me-auto'>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.search)}>Search</span>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.upload)}>Upload</span>
              <span className='nav-link' role='button' onClick={() => this.props.onNavItemClick(NavBarState.queue)}>Queue</span>
            </div>
            {this.state.user &&
              <div>
                <img src={this.state.user.avatarUrl} alt='avatar url' className='me-2 rounded-circle' style={{ width: '2rem' }} />
                <span className='text-white me-1'>{this.state.user.login}</span>
                {this.state.user.isAdmin && <span className='text-secondary me-1'>| administrator</span>}
              </div>}
          </div>
        </div>
      </nav>
    );
  }

  async componentDidMount () {
    try {
      const getUserResult = await this.props.tracksAboutApiClient.getUser();
      if (!getUserResult.success) {
        this.props.onGetUserError(getUserResult.message);
      }

      this.setState({ user: getUserResult.user });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
