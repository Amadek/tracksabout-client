import React from 'react';

export default class Navbar extends React.Component {
  render () {
    return (
      <nav className='navbar navbar-dark bg-dark'>
        <div className='container-fluid'>
          <a className='navbar-brand' href='#a'>TracksAbout</a>
        </div>
      </nav>
    );
  }
}
