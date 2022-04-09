import React from 'react';
import assert from 'assert';
import Logger from '../Logic/Logger';
import ContainerHeightProvider from '../Logic/ContainerHeightProvider';
import TracksAboutApiClient from '../Logic/TracksAboutApiClient';
import AlbumImagesCache from '../Logic/AlbumImagesCache';
import DynamicAlbumCoverImage from './AlbumCoverImage/DynamicAlbumCoverImage';
import PreviousButton from './PlayBar/PreviousButton';
import NextButton from './PlayBar/NextButton';
import PlayButton from './PlayBar/PlayButton';
import ProgressBar from './PlayBar/ProgressBar';
import PlayBarAlert from './PlayBar/PlayBarAlert';

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
    this.props.playingQueue.onTrackQueued = this._handleTrackQueued.bind(this);

    this.audioElement = React.createRef();
    this.handleTogglePlayButton = this._handleTogglePlayButton.bind(this);
    this.handleClickNextButton = this._handleClickNextButton.bind(this);
    this.handleClickPreviousButton = this._handleClickPreviousButton.bind(this);

    this.state = {
      alertMessage: '',
      trackProgress: 0,
      playing: false,
      playingTrackCurrentTime: new Date(0, 0, 1, 0, 0, 0).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
    };
  }

  render () {
    return (
      <div className='container-fluid bottom-0 p-0 bg-light'>
        {this.state.alertMessage && <PlayBarAlert message={this.state.alertMessage} />}
        <audio
          ref={this.audioElement}
          src={this.props.tracksAboutApiClient.getStreamTrackUrl(this.props.playingQueue.getTrackToPlay()._id)}
          crossOrigin='anonymous'
        />
        <ProgressBar trackProgress={this.state.trackProgress} />
        <div className='d-flex align-items-center justify-content-between'>
          <div className='w-100 d-flex align-items-center p-3'>
            <DynamicAlbumCoverImage
              albumId={this.props.playingQueue.getTrackToPlay().albumId}
              albumImagesCache={this.props.albumImagesCache}
              rotateImage={this.state.playing}
              className='me-3'
              style={{ width: '2.5rem' }}
            />
            <span>{this.props.playingQueue.getTrackToPlay().title}</span>
          </div>
          <div className='d-flex align-items-center justify-content-center'>
            <PreviousButton playingQueue={this.props.playingQueue} playing={this.state.playing} onClick={this.handleClickPreviousButton} />
            <PlayButton playing={this.state.playing} onClick={this.handleTogglePlayButton} />
            <NextButton playingQueue={this.props.playingQueue} playing={this.state.playing} onClick={this.handleClickNextButton} />
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

  _handleTrackQueued (track) {
    try {
      assert.ok(track);
      this._logger.log(this, `Handle queued track: ${track.title}`);
      // Występują tu dwa problemy:
      // 1. Alert nie pojawia się ponownie - problem z brakiem odswiezania reacta, bo message jest zawsze true, resetowanie message nie działa bez timoeutu.
      // 2. Alert nie pojawia sie na pierwszym dodaniu playbara - nie wiem czy to aż taki duży problem.
      this.setState({ alertMessage: `Track ${track.title} queued.` });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
