import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();

    this.handleArtistClick = this._handleArtistClick.bind(this);
    this.state = {
      searchArtistErrorMessage: null
    };
  }

  render () {
    const tracks = this.props.album.tracks.map(t =>
      <div key={t.number} className='p-3 border-bottom'>
        {t.number}. {t.title}
      </div>
    );

    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-2 p-3 bg-light border-end'>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.album.name}</li>
              <li className='text-secondary' role='button' onClick={this.handleArtistClick}>{this.props.album.artistName}</li>
              <li className='text-secondary'>{this.props.album.year}</li>
            </ul>
          </div>
          <div className='col-10 p-0'>
            <div className='mx-3'>
              {this.state.searchArtistErrorMessage && <Alert message={this.state.searchArtistErrorMessage} />}
            </div>
            {tracks}
          </div>
        </div>
      </div>
    );
  }

  async _handleArtistClick () {
    try {
      const searchArtistResult = await this.props.tracksAboutApiClient.searchById(this.props.album.artistId);
      if (!searchArtistResult.success) {
        this._logger.log(this, `Search artist by Id failed.\n${searchArtistResult.message}`);
        this.setState({ searchArtistErrorMessage: searchArtistResult.message });
        return;
      }

      this.props.onArtistLoaded(searchArtistResult.obj);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
