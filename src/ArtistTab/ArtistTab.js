import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';
import ContainerHeightProvider from '../ContainerHeightProvider';
import TracksAboutApiClient from '../TracksAboutApiClient';

export default class ArtistTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracksAboutApiClient instanceof TracksAboutApiClient);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    this._logger = new Logger();

    this.handleAlbumClick = this._handleAlbumClick.bind(this);
    this.state = {
      searchAlbumErrorMessage: null
    };
  }

  render () {
    const albums = this.props.artist.albums.map(a =>
      <div
        key={a._id}
        className='p-3 m-2 border' role='button'
        onClick={() => this.handleAlbumClick(a._id)}
      >
        {a.name}<br />
        <span className='text-secondary'>{a.year}</span>
      </div>
    );

    return (
      <div className='container-fluid' style={{ ...this.props.containerHeightProvider.provideStyles() }}>
        <div className='row' style={{ height: '100%' }}>
          <div className='col-2 p-3 bg-light border-end'>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.artist.name}</li>
            </ul>
          </div>
          <div className='col-10 p-2' style={{ height: '100%', overflowY: 'auto' }}>
            {this.state.searchAlbumErrorMessage && <Alert message={this.state.searchAlbumErrorMessage} />}
            <div className='d-flex flex-wrap'>
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
