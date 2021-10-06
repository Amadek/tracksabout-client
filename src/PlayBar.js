import React from 'react';
import assert from 'assert';
import Logger from './Logger';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default class PlayBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();

    this.audioElement = React.createRef();
    this.handleTogglePlayButton = this._handleTogglePlayButton.bind(this);

    this.state = {
      trackProgress: 0,
      playing: false
    };
  }

  render () {
    return (
      <div className='container-fluid position-fixed bottom-0 p-0 bg-light'>
        <audio
          ref={this.audioElement}
          src={this.props.trackToPlay && this.props.tracksAboutApiClient.getStreamTrackUrl(this.props.trackToPlay._id)}
          crossOrigin='anonymous'
        />
        <div className='progress' style={{ borderRadius: 0, height: '.5rem' }}>
          <div className='progress-bar m-0' role='progressbar' style={{ width: this.state.trackProgress + '%', height: '.5rem' }} />
        </div>

        <div className='text-center text-secondary' role='button' onClick={this.handleTogglePlayButton}>
          <i className={this.state.playing ? 'bi-pause' : 'bi-play'} style={{ fontSize: '2rem' }} />
        </div>
      </div>
    );
  }

  componentDidMount () {
    try {
      this.audioElement.current.addEventListener('ended', () => {
        this._logger.log(this, `Track ${this.props.trackToPlay.title} ended.`);
        this.setState({ playing: false });
      });
      this.audioElement.current.addEventListener('timeupdate', () => {
        this.setState({ trackProgress: this.audioElement.current.currentTime * 100.0 / this.props.trackToPlay.duration });
      });
      this.audioElement.current.addEventListener('error', () => {
        this._logger.log(this, 'Track stream error:');
        this._logger.log(this, this.audioElement.current.error);
        this.setState({ playing: false });
      });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleTogglePlayButton () {
    try {
      if (this.state.playing) {
        this.audioElement.current.pause();
        this.setState({ playing: false });
        this._logger.log(this, `Track ${this.props.trackToPlay.title} paused.`);
        return;
      }

      this.audioElement.current.play();
      this.setState({ playing: true });
      this._logger.log(this, 'Playing track ' + this.props.trackToPlay.title);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
