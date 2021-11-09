import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';
import ContainerHeightProvider from '../ContainerHeightProvider';
import TracksAboutApiClient from '../TracksAboutApiClient';
import AlbumCoverImage from '../AlbumCoverImage/AlbumCoverImage';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';

export default class ArtistTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracksAboutApiClient instanceof TracksAboutApiClient);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    this._logger = new Logger();

    this.handleAlbumClick = this._handleAlbumClick.bind(this);
    this.state = {
      searchAlbumErrorMessage: null
    };
  }

  render () {
    const albums = this.props.artist.albums.map(album =>
      <div
        key={album._id}
        className='m-2' role='button' style={{ width: '16rem' }}
        onClick={() => this.handleAlbumClick(album._id)}
      >
        <AlbumCoverImage albumId={album._id} albumName={album.name} albumYear={album.year} albumImagesCache={this.props.albumImagesCache} />
      </div>
    );

    return (
      <div className='container-fluid' style={{ ...this.props.containerHeightProvider.provideStyles() }}>
        <div className='row' style={{ height: '100%', overflowY: 'auto' }}>
          <div className='col p-0'>
            <div className='p-3 bg-light border-bottom fs-5'>
              {this.props.artist.name}
            </div>
            <div className='p-2'>
              {this.state.searchAlbumErrorMessage && <Alert message={this.state.searchAlbumErrorMessage} />}
              <div className='d-flex flex-wrap'>
                {albums}
              </div>
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
