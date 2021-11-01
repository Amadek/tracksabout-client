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
      // TODO AP Zrobić jakiegoś providera który będzie mówił jak duże może być body aplikacji.
      <div className='container-fluid' style={{ height: 'calc(100% - 97px - 76px)', overflowY: 'auto' }}>
        <div className='row' style={{ height: '100%' }}>
          <div className='col-2 p-3 bg-light border-end'>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.artist.name}</li>
            </ul>
          </div>
          <div className='col-10 p-2'>
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
