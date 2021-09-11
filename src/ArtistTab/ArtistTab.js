import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';

export default class ArtistTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();

    this.handleAlbumClick = this._handleAlbumClick.bind(this);
    this.state = {
      searchAlbumErrorMessage: null
    };
  }

  render () {
    const albums = this.props.artist.albums.map(a =>
      <div className='col-3' key={a._id}>
        <div
          className='p-3 mt-3 border' role='button'
          onClick={() => this.handleAlbumClick(a._id)}
        >
          {a.name}<br />
          <span className='text-secondary'>{a.year}</span>
        </div>
      </div>
    );

    return (
      <div className='container-fluid border-top'>
        <div className='row'>
          <div className='col-2 p-3 bg-light'>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.artist.name}</li>
            </ul>
          </div>
          <div className='col-10 border-start'>
            {this.state.searchAlbumErrorMessage && <Alert message={this.state.searchAlbumErrorMessage} />}
            <div className='row'>
              {albums}
            </div>
          </div>
        </div>
      </div>
    );
  }

  async _handleAlbumClick (albumId) {
    try {
      assert.ok(albumId);
      const searchAlbumResult = await this.props.tracksAboutApiClient.searchById(albumId);
      if (!searchAlbumResult.success) {
        this._logger.log(this, `Search album by Id failed.\n${searchAlbumResult.message}`);
        this.setState({ searchAlbumErrorMessage: searchAlbumResult.message });
        return;
      }

      this.props.onAlbumLoaded(searchAlbumResult.obj);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
