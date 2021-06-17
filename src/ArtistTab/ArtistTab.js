import React from 'react';
import assert from 'assert';
import Logger from '../Logger';

export default class ArtistTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();
  }

  render () {
    const albums = this.props.artist.albums.map(a =>
      <div key={a._id} className='col-3 p-2 m-2 border' onClick={() => this.props.onAlbumClick(a._id)} role='button'>
        {a.name}<br />
        <span className='text-secondary'>{a.year}</span>
      </div>
    );

    return (
      <div className='container-fluid border-top'>
        <div className='row'>
          <div className='col-2 pt-2 bg-light'>
            <ul className='list-group'>
              <li className='fs-5'>{this.props.artist.name}</li>
            </ul>
          </div>
          <div className='col-10 border-start'>
            <div className='row p-2'>
              {albums}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
