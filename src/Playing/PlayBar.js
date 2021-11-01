import React from 'react';
import assert from 'assert';
import Logger from '../Logger';

export default class PlayBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    assert.ok(this.props.playingQueue);
    assert.ok(this.props.onPlayBarChanged);

    this._logger = new Logger();
    this._playingQueueHash = this.props.playingQueue.hash;
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
      this._audioElementEventListeners = this._createAudioElementEventListeners();

      for (const eventListenerProperty in this._audioElementEventListeners) {
        this.audioElement.current.addEventListener(this._audioElementEventListeners[eventListenerProperty].name, this._audioElementEventListeners[eventListenerProperty].listener);
      }

      this.audioElement.current.play();
      const playingTrack = this.props.playingQueue.getTrackToPlay();
      this._logger.log(this, 'Playing track on mounting component: ' + playingTrack.title);
      this.setState({ playing: true });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  componentDidUpdate () {
    try {
      // We only force playing in componenent when playing queue hash has changed.
      if (this._playingQueueHash === this.props.playingQueue.hash) return;

      // TODO mamy takiego małego buga, jak sie utwor jeszcze laduje i zacznie sie zmieniac grany utwor to leci DOMException: The play() request was interrupted by a new load request. https://goo.gl/LdLk22
      this.audioElement.current.pause();
      this.audioElement.current.play();
      const playingTrack = this.props.playingQueue.getTrackToPlay();
      this._logger.log(this, 'Playing track on updating component: ' + playingTrack.title);
      this.setState({ playing: true });
      this._playingQueueHash = this.props.playingQueue.hash;
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  componentWillUnmount () {
    try {
      if (!this._audioElementEventListeners) return;

      for (const eventListenerProperty in this._audioElementEventListeners) {
        this.audioElement.current.removeEventListener(this._audioElementEventListeners[eventListenerProperty].name, this._audioElementEventListeners[eventListenerProperty].listener);
      }

      this.audioElement.current.pause();
      this._logger.log(this, 'Track stopped on unmounting component.');
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _createAudioElementEventListeners () {
    return {
      ended: {
        name: 'ended',
        listener: () => {
          this._logger.log(this, `Track ${this.props.playingQueue.getTrackToPlay().title} ended.`);

          if (this.props.playingQueue.queueEndReached) {
            this.setState({ playing: false });
            return;
          }

          const playingTrack = this.props.playingQueue.getNextTrackToPlay();
          this.props.onPlayBarChanged(this.props.playingQueue);

          this._logger.log(this, `Track ${playingTrack.title} is next.`);
          this.setState({ playing: true }, () => {
            this.props.onPlayBarChanged(this.props.playingQueue);
            this.audioElement.current.play();
          });
        }
      },
      playing: {
        name: 'playing',
        listener: () => this.setState({ playing: true })
      },
      timeupdate: {
        name: 'timeupdate',
        listener: () => {
          const playingTrackCurrentTime = new Date(0, 0, 1, 0, 0, this.audioElement.current.currentTime).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
          this.setState({ trackProgress: this.audioElement.current.currentTime * 100.0 / this.props.playingQueue.getTrackToPlay().duration, playingTrackCurrentTime });
        }
      },
      waiting: {
        name: 'waiting',
        listener: () => this.setState({ playing: null })
      },
      error: {
        name: 'error',
        listener: () => {
          this._logger.log(this, 'Track stream error:');
          this._logger.log(this, this.audioElement.current.error);
          this.setState({ playing: false });
        }
      }
    };
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
      this.props.onPlayBarChanged(this.props.playingQueue);

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
      this.props.onPlayBarChanged(this.props.playingQueue);

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
      if (!this.audioElement.current) {
        this._logger.log(this, 'Audio element is currently null. No action required.');
        return;
      }

      this.audioElement.current.pause();
      this.setState({ playing: false }, () => {
        this.audioElement.current.play();
        this._logger.log(this, 'Playing track from reset queue.');
        this.setState({ playing: true });
      });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
