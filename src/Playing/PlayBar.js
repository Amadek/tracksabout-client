import React from 'react';
import assert from 'assert';
import Logger from '../Logger';
import ContainerHeightProvider from '../ContainerHeightProvider';
import TracksAboutApiClient from '../TracksAboutApiClient';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';
import DynamicAlbumCoverImage from '../AlbumCoverImage/DynamicAlbumCoverImage';
import Alert from '../Alert';

export default class PlayBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracksAboutApiClient instanceof TracksAboutApiClient);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    assert.ok(props.playingQueue);
    assert.ok(props.onPlayBarChanged);

    this._logger = new Logger();
    this._playingQueueHash = this.props.playingQueue.hash;
    this.props.playingQueue.onReset = this._handleQueueReset.bind(this);

    this.audioElement = React.createRef();
    this.handleTogglePlayButton = this._handleTogglePlayButton.bind(this);
    this.handleClickNextButton = this._handleClickNextButton.bind(this);
    this.handleClickPreviousButton = this._handleClickPreviousButton.bind(this);

    this.state = {
      dupsko: false,
      trackProgress: 0,
      playing: false,
      playingTrackCurrentTime: new Date(0, 0, 1, 0, 0, 0).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
    };
  }

  render () {
    return (
      <div className='container-fluid bottom-0 p-0 bg-light'>
        <Alert
          message='DYNAMICZNY ALERT'
          alertType='alert-secondary'
          style={{ borderRadius: 0, position: 'fixed', width: '700px', left: 'calc(50% - 700px / 2)', bottom: '6rem' }}
        />
        <audio
          ref={this.audioElement}
          src={this.props.tracksAboutApiClient.getStreamTrackUrl(this.props.playingQueue.getTrackToPlay()._id)}
          crossOrigin='anonymous'
        />
        <div className='progress border-top' style={{ borderRadius: 0, height: '.25rem' }}>
          <div className='progress-bar m-0' role='progressbar' style={{ width: this.state.trackProgress + '%', height: '.5rem' }} />
        </div>

        <div className='d-flex align-items-center justify-content-between'>
          <div className='w-100 d-flex align-items-center p-3'>
            <div className='me-3 ' style={{ width: '2.5rem' }}>
              <DynamicAlbumCoverImage albumId={this.props.playingQueue.getTrackToPlay().albumId} albumImagesCache={this.props.albumImagesCache} rotateImage={this.state.playing} />
            </div>
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
      this.setState({ dupsko: true });

      this.props.containerHeightProvider.addPlayBarHeight();

      this._audioElementEventListeners = this._createAudioElementEventListeners();

      for (const eventListenerProperty in this._audioElementEventListeners) {
        this.audioElement.current.addEventListener(this._audioElementEventListeners[eventListenerProperty].name, this._audioElementEventListeners[eventListenerProperty].listener);
      }

      const playingTrack = this.props.playingQueue.getTrackToPlay();
      this._logger.log(this, 'Playing track on mounting component: ' + playingTrack.title);
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  componentDidUpdate () {
    try {
      // We only force playing in componenent when playing queue hash has changed and playing is turned on.
      if (this._playingQueueHash === this.props.playingQueue.hash || !this.state.playing) return;

      const playingTrack = this.props.playingQueue.getTrackToPlay();
      this._logger.log(this, 'Playing track on updating component: ' + playingTrack.title);
      this._playingQueueHash = this.props.playingQueue.hash;
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  componentWillUnmount () {
    try {
      this.props.containerHeightProvider.removePlayBarHeight();

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
          this.audioElement.current.play().catch(err => this._logger.log(this, err));
        }
      },
      playing: {
        name: 'playing',
        listener: () => this.setState({ playing: true })
      },
      pause: {
        name: 'pause',
        listener: () => this.setState({ playing: false })
      },
      timeupdate: {
        name: 'timeupdate',
        listener: () => {
          const playingTrackCurrentTime = new Date(0, 0, 1, 0, 0, this.audioElement.current.currentTime).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
          this.setState({
            trackProgress: this.audioElement.current.currentTime * 100.0 / this.props.playingQueue.getTrackToPlay().duration,
            playingTrackCurrentTime
          });
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
        this._logger.log(this, `Pausing track ${playingTrack.title}`);
        this.audioElement.current.pause();
        return;
      }

      this._logger.log(this, 'Playing track ' + playingTrack.title);
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
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
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
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
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
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

      this._logger.log(this, 'Playing track from reset queue.');
      this.audioElement.current.play().catch(err => this._logger.log(this, err));
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
