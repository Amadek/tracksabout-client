import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    assert.ok(this.props.onTrackDoubleClick);
    this._logger = new Logger();

    this.handleTrackClick = this._handleTrackClick.bind(this);
    this.handleArtistClick = this._handleArtistClick.bind(this);
    this.state = {
      searchArtistErrorMessage: null,
      clickedTrackId: null
    };
  }

  render () {
    const tracksTable = (
      <div className='table-responsive'>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>Title</th>
              <th scope='row'>Duration</th>
            </tr>
          </thead>
          <tbody>
            {this.props.album.tracks.map(track =>
              <tr
                key={track._id}
                onClick={() => this.handleTrackClick(track._id)}
                onDoubleClick={() => this.props.onTrackDoubleClick(track)}
                className={this.state.clickedTrackId === track._id ? 'table-primary' : ''}
              >
                <td scope='row'>{track.number}</td>
                <td scope='row'>{track.title}</td>
                <td scope='row'>{track.duration} s</td>
              </tr>
            )}
          </tbody>
        </table>
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
            {tracksTable}
          </div>
        </div>
      </div>
    );
  }

  async _handleTrackClick (trackId) {
    try {
      assert.ok(trackId);
      this.setState({ clickedTrackId: trackId });
    } catch (error) {
      this._logger.log(this, error);
    }
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
