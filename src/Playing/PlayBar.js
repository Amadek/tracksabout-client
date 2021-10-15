import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default class PlayBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    assert.ok(this.props.playingQueue);
    this._logger = new Logger();
    this.props.playingQueue.onReset = this._handleQueueReset.bind(this);

    this.audioElement = React.createRef();
    this.handleTogglePlayButton = this._handleTogglePlayButton.bind(this);
    this.handleClickNextButton = this._handleClickNextButton.bind(this);
    this.handleClickPreviousButton = this._handleClickPreviousButton.bind(this);

    this.state = {
      trackProgress: 0,
      playing: false,
      playingTrackCurrentTime: new Date(0, 0, 1, 0, 0, 0).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
    };
  }

  render () {
    return (
      <div className='container-fluid position-fixed bottom-0 p-0 bg-light'>
        <audio
          ref={this.audioElement}
          src={this.props.tracksAboutApiClient.getStreamTrackUrl(this.props.playingQueue.getTrackToPlay()._id)}
          crossOrigin='anonymous'
        />
        <div className='progress border-top' style={{ borderRadius: 0, height: '.25rem' }}>
          <div className='progress-bar m-0' role='progressbar' style={{ width: this.state.trackProgress + '%', height: '.5rem' }} />
        </div>

        <div className='d-flex align-items-center justify-content-between'>
          <div className='w-100 p-3'>
            <span>{this.props.playingQueue.getTrackToPlay().title}</span>
          </div>
          <div className='d-flex align-items-center justify-content-center'>
            <i
              style={{ fontSize: '2rem' }}
              className={'bi-skip-start me-1 ' + (this.props.playingQueue.queueStartReached || this.state.playing === null ? 'text-secondary' : '')}
              role={this.props.playingQueue.queueStartReached ? '' : 'button'}
              onClick={this.handleClickPreviousButton}
            />
            {this.state.playing === null
              ? <span className='spinner-border text-secondary' style={{ width: '2rem', height: '2rem', margin: '1.25rem .5rem' }} role='status' aria-hidden='true' />
              : <i
                  className={this.state.playing ? 'bi-pause' : 'bi-play-fill'}
                  style={{ fontSize: '3rem' }} role='button'
                  onClick={this.handleTogglePlayButton}
                />}
            <i
              style={{ fontSize: '2rem' }}
              className={'bi-skip-end ' + (this.props.playingQueue.queueEndReached || this.state.playing === null ? 'text-secondary' : '')}
              role={this.props.playingQueue.queueEndReached ? '' : 'button'}
              onClick={this.handleClickNextButton}
            />
          </div>
          <div className='w-100 text-end p-3'>
            {this.state.playingTrackCurrentTime}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount () {
    try {
      this.audioElement.current.addEventListener('ended', () => {
        this._logger.log(this, `Track ${this.props.playingQueue.getTrackToPlay().title} ended.`);

        if (this.props.playingQueue.queueEndReached) {
          this.setState({ playing: false });
          return;
        }

        const playingTrack = this.props.playingQueue.getNextTrackToPlay();
        this._logger.log(this, `Track ${playingTrack.title} is next.`);
        this.setState({ playing: true }, () => {
          this.audioElement.current.play();
        });
      });
      this.audioElement.current.addEventListener('playing', () => {
        this.setState({ playing: true });
      });
      this.audioElement.current.addEventListener('timeupdate', () => {
        const playingTrackCurrentTime = new Date(0, 0, 1, 0, 0, this.audioElement.current.currentTime).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
        this.setState({ trackProgress: this.audioElement.current.currentTime * 100.0 / this.props.playingQueue.getTrackToPlay().duration, playingTrackCurrentTime });
      });
      this.audioElement.current.addEventListener('waiting', () => {
        this.setState({ playing: null });
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
      const playingTrack = this.props.playingQueue.getTrackToPlay();

      if (this.state.playing) {
        this.audioElement.current.pause();
        this.setState({ playing: false });
        this._logger.log(this, `Track ${playingTrack.title} paused.`);
        return;
      }

      this.audioElement.current.play();
      this.setState({ playing: true });
      this._logger.log(this, 'Playing track ' + playingTrack.title);
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleClickNextButton () {
    try {
      if (this.props.playingQueue.queueEndReached || this.state.playing === null) return;

      const playingTrack = this.props.playingQueue.getNextTrackToPlay();
      this._logger.log(this, `Track ${playingTrack.title} is next (clicked next button).`);
      this.setState({ playing: true }, () => {
        this.audioElement.current.play();
      });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleClickPreviousButton () {
    try {
      if (this.props.playingQueue.queueStartReached || this.state.playing === null) return;

      const playingTrack = this.props.playingQueue.getPreviousTrackToPlay();
      this._logger.log(this, `Track ${playingTrack.title} is next (clicked previous button).`);
      this.setState({ playing: true }, () => {
        this.audioElement.current.play();
      });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleQueueReset () {
    try {
      this._logger.log(this, 'Playing queue reset checked.');
      this.audioElement.current.pause();
      this.setState({ playing: false });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
