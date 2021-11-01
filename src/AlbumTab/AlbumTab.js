import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import Alert from '../Alert';
import AlbumTrack from './AlbumTrack';

export default class AlbumTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    assert.ok(this.props.onTrackDoubleClick);
    assert.ok(this.props.onPlaySelectedTracks);
    assert.ok(this.props.onQueueSelectedTracks);
    assert.ok(this.props.album?.tracks);
    this._logger = new Logger();

    this.handleTrackClick = this._handleTrackClick.bind(this);
    this.handleArtistClick = this._handleArtistClick.bind(this);

    this.state = {
      searchArtistErrorMessage: null,
      tracks: this.props.album.tracks
        .sort((trackA, trackB) => trackA.number - trackB.number)
        .map((track, index) => { const albumTrack = new AlbumTrack(track, index); return albumTrack; }),
      selectedTracks: []
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
              <th scope='col'><i className='bi bi-three-dots-vertical' /></th>
              <th scope='col'>Duration</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tracks.map(track =>
              <tr
                key={track._id}
                className={this.state.selectedTracks.indexOf(track) !== -1 ? 'table-primary' : ''}
                style={{ userSelect: 'none' }}
              >
                <td>{track.index}</td>
                <td
                  onClick={(event) => this.handleTrackClick(event, track)}
                  onDoubleClick={() => this.props.onTrackDoubleClick(this.props.album.tracks)}
                >{track.title}
                </td>
                <td>
                  {this.state.selectedTracks.indexOf(track) !== -1 &&
                    <div className='dropend'>
                      <i className='bi bi-three-dots-vertical' data-bs-toggle='dropdown' aria-expanded='false' role='button' />
                      <ul className='dropdown-menu' style={{ borderRadius: 0 }}>
                        <li><button className='dropdown-item' onClick={() => this.props.onPlaySelectedTracks(this.state.selectedTracks)}>Play</button></li>
                        <li><button className='dropdown-item' onClick={() => this.props.onQueueSelectedTracks(this.state.selectedTracks)}>Add to queue</button></li>
                      </ul>
                    </div>}
                </td>
                <td>{new Date(0, 0, 1, 0, 0, track.duration).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className='container-fluid' style={{ height: 'calc(100% - 97px)' }}>
        <div className='row' style={{ height: '100%' }}>
          <div className='col-2 p-3 bg-light border-end'>
            <ul className='list-unstyled'>
              <li className='fs-5'>{this.props.album.name}</li>
              <li className='text-secondary' role='button' onClick={this.handleArtistClick}>{this.props.album.artistName}</li>
              <li className='text-secondary'>{this.props.album.year}</li>
            </ul>
            <button
              onClick={() => this.props.onTrackDoubleClick(this.props.album.tracks)}
              type='button' className='btn btn-outline-dark p-1' style={{ width: '100%', borderRadius: 0 }}
            >Play
            </button>
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

  async _handleTrackClick (event, clickedTrack) {
    try {
      assert.ok(event);
      assert.ok(clickedTrack);

      if (event.shiftKey) {
        this.setState({ selectedTracks: this._selectTracksWithShift(clickedTrack, this.state.selectedTracks, this.state.tracks) });
        return;
      }

      if (!event.ctrlKey) {
        this.state.selectedTracks = [];
      }

      const clickedTrackIndex = this.state.selectedTracks.indexOf(clickedTrack);
      if (clickedTrackIndex !== -1) this.state.selectedTracks.splice(clickedTrackIndex, 1);
      else this.state.selectedTracks.push(clickedTrack);

      this.setState({ selectedTracks: this.state.selectedTracks });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  /**
   * @param {AlbumTrack} clickedTrack
   * @param {AlbumTrack[]} selectedTracks
   * @param {AlbumTrack[]} tracks
   */
  _selectTracksWithShift (clickedTrack, selectedTracks, tracks) {
    const firstSelectedTrackIndex = selectedTracks[0]?.index ?? 0;
    const newSelectedTracks = [];

    if (clickedTrack.index > firstSelectedTrackIndex) {
      for (let trackIndex = firstSelectedTrackIndex; trackIndex <= clickedTrack.index; trackIndex++) {
        const track = tracks.find(t => t.index === trackIndex);
        newSelectedTracks.push(track);
      }
    } else {
      for (let trackIndex = firstSelectedTrackIndex; trackIndex >= clickedTrack.index; trackIndex--) {
        const track = tracks.find(t => t.index === trackIndex);
        newSelectedTracks.push(track);
      }
    }

    return newSelectedTracks;
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
