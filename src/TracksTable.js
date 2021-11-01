import React from 'react';
import assert from 'assert';
import Logger from './Logger';

export default class TracksTable extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracks);
    assert.ok(props.playingTrackId || true);
    assert.ok(props.onTrackClick || true);
    assert.ok(props.onPlaySelectedTracks || true);
    assert.ok(props.onQueueSelectedTracks || true);
    assert.ok(props.onRemoveSelectedTracks || true);
    assert.ok(props.onPlayFromSelectedTrack || true);
    this._logger = new Logger();

    this.handleTrackClick = this._handleTrackClick.bind(this);

    this.state = { selectedTrackIds: [] };
  }

  render () {
    const trackRows = this.props.tracks.map((track, index) =>
      <tr
        key={track._id}
        className={this.state.selectedTrackIds.indexOf(track._id) !== -1 ? 'table-primary' : ''}
        style={{ userSelect: 'none' }}
      >
        <td>{(track._id === this.props.playingTrackId && <i className='bi-play-fill' />)}</td>
        <td>{index + 1}</td>
        <td
          onClick={(event) => this.handleTrackClick(event, track)}
          onDoubleClick={() => this.props.onTrackDoubleClick(track)}
        >{track.title}
        </td>
        <td>
          {this.state.selectedTrackIds.indexOf(track._id) !== -1 &&
            <div className='dropend'>
              <i className='bi bi-three-dots-vertical' data-bs-toggle='dropdown' aria-expanded='false' role='button' />
              <ul className='dropdown-menu' style={{ borderRadius: 0 }}>
                {this.props.onPlaySelectedTracks && <li><button className='dropdown-item' onClick={() => this.props.onPlaySelectedTracks(this.state.selectedTrackIds)}>Play</button></li>}
                {this.props.onQueueSelectedTracks && <li><button className='dropdown-item' onClick={() => this.props.onQueueSelectedTracks(this.state.selectedTrackIds)}>Add to queue</button></li>}
                {this.props.onRemoveSelectedTracks && <li><button className='dropdown-item' onClick={() => this.props.onRemoveSelectedTracks(this.state.selectedTrackIds)}>Remove</button></li>}
                {this.props.onPlayFromSelectedTrack && <li><button className='dropdown-item' onClick={() => this.props.onPlayFromSelectedTrack(track._id)}>Play</button></li>}
              </ul>
            </div>}
        </td>
        <td>{track.albumName}</td>
        <td>{track.artistName}</td>
        <td>{new Date(0, 0, 1, 0, 0, track.duration).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</td>
      </tr>
    );

    return (
      <table className='table table-striped'>
        <thead>
          <tr>
            <th scope='col'>{this.props.tracks.length}</th>
            <th scope='col'>#</th>
            <th scope='col'>Title</th>
            <th scope='col'><i className='bi bi-three-dots-vertical' /></th>
            <th scope='col'>Album</th>
            <th scope='col'>Artist</th>
            <th scope='col'>Duration</th>
          </tr>
        </thead>
        <tbody>
          {trackRows}
        </tbody>
      </table>
    );
  }

  componentDidMount () {
    try {
      // Select first track as default behavior.
      if (!this.props.tracks[0]) return;

      this.state.selectedTrackIds.push(this.props.tracks[0]._id);
      this.setState({ selectedTrackIds: this.state.selectedTrackIds }, () => this.props.onTrackClick && this.props.onTrackClick(this.props.tracks[0]));
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleTrackClick (event, clickedTrack) {
    try {
      assert.ok(event);
      assert.ok(clickedTrack);

      if (this.props.onTrackClick) this.props.onTrackClick(clickedTrack);

      if (event.shiftKey) {
        this.setState({ selectedTrackIds: this._selectTracksWithShift(clickedTrack, this.state.selectedTrackIds, this.props.tracks) });
        return;
      }

      if (!event.ctrlKey) {
        this.state.selectedTrackIds = [];
      }

      const clickedTrackIdIndex = this.state.selectedTrackIds.indexOf(clickedTrack._id);
      if (clickedTrackIdIndex !== -1) this.state.selectedTrackIds.splice(clickedTrackIdIndex, 1);
      else this.state.selectedTrackIds.push(clickedTrack._id);

      this.setState({ selectedTrackIds: this.state.selectedTrackIds });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _selectTracksWithShift (clickedTrack, selectedTrackIds, tracks) {
    const clickedTrackIndex = tracks.indexOf(clickedTrack);
    let firstSelectedTrackIndex = tracks.indexOf(tracks.find(track => track._id === selectedTrackIds[0]));
    firstSelectedTrackIndex = firstSelectedTrackIndex === -1 ? 0 : firstSelectedTrackIndex; // 0 as default index if array was empty.
    const newSelectedTrackIds = [];

    if (clickedTrackIndex > firstSelectedTrackIndex) {
      for (let trackIndex = firstSelectedTrackIndex; trackIndex <= clickedTrackIndex; trackIndex++) {
        const track = tracks.find(t => tracks.indexOf(t) === trackIndex);
        newSelectedTrackIds.push(track._id);
      }
    } else {
      for (let trackIndex = firstSelectedTrackIndex; trackIndex >= clickedTrackIndex; trackIndex--) {
        const track = tracks.find(t => tracks.indexOf(t) === trackIndex);
        newSelectedTrackIds.push(track._id);
      }
    }

    return newSelectedTrackIds;
  }
}