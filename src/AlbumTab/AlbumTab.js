import React from 'react';
import assert from 'assert';
import Logger from '../Logger';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();
  }

  render () {
    this._logger.log(this, JSON.stringify(this.props.album, null, 2));

    const tracks = this.props.album.tracks.map((t, index) =>
      <div key={t._id} className='row'>
        <div className='col-10 p-2 border-bottom'>
          {index + 1}. {t.title}
        </div>
      </div>
    );

    return (
      <div className='container-fluid border-top'>
        <div className='row'>
          <div className='col-2 pt-2 bg-light'>
            <ul className='list-group'>
              <li className='fs-5'>{this.props.album.name}</li>
              <li className='text-secondary'>{this.props.album.artistName}, {this.props.album.year}</li>
            </ul>
          </div>
          <div className='col-10 border-start'>
            <div className='row'>
              {tracks}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
