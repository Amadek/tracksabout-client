import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();

    this.audioElement = React.createRef();
    this.handleTrackClick = this._handleTrackClick.bind(this);
    this.handleTrackDoubleClick = this._handleTrackDoubleClick.bind(this);
    this.handleArtistClick = this._handleArtistClick.bind(this);
    this.state = {
      searchArtistErrorMessage: null,
      clickedTrackId: null,
      doubleClickedTrackId: null
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
            </tr>
          </thead>
          <tbody>
            {this.props.album.tracks.map(track =>
              <tr
                key={track._id}
                onClick={() => this.handleTrackClick(track._id)}
                onDoubleClick={() => this.handleTrackDoubleClick(track._id)}
                className={this.state.clickedTrackId === track._id && 'table-primary'}
              >
                <th scope='row'>{track.number}</th>
                <td>{track.title}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className='container-fluid'>
        <audio
          ref={this.audioElement}
          src={this.state.doubleClickedTrackId && this.props.tracksAboutApiClient.getStreamTrackUrl(this.state.doubleClickedTrackId)}
          crossOrigin='anonymous'
        />
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

  componentDidMount () {
    const audioContext = new window.AudioContext();
    const track = audioContext.createMediaElementSource(this.audioElement.current);
    track.connect(audioContext.destination);
  }

  async _handleTrackClick (trackId) {
    try {
      assert.ok(trackId);
      this.setState({ clickedTrackId: trackId });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleTrackDoubleClick (trackId) {
    try {
      assert.ok(trackId);

      this.setState({ doubleClickedTrackId: trackId }, () => {
        this.audioElement.current.play();
      });
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
