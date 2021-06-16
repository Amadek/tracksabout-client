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
    return (
      <div className='container pt-4'>
        <p>{this.props.album.name}</p>
        <p>{this.props.album.year}</p>
      </div>
    );
  }
}
