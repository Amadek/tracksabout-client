import React from 'react';
import assert from 'assert';
import Logger from './Logger';

export default class PlayBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();
    this._audioContextConnected = false;
    this._playing = false;

    this.audioElement = React.createRef();
    this.handleTogglePlayButton = this._handleTogglePlayButton.bind(this);
  }

  render () {
    return (
      <div className='container-fluid position-fixed bottom-0 p-3 bg-light border-top'>
        <audio
          ref={this.audioElement}
          src={this.props.trackToPlayId && this.props.tracksAboutApiClient.getStreamTrackUrl(this.props.trackToPlayId)}
          crossOrigin='anonymous'
        />
        <div className='text-center text-secondary' role='button' onClick={this.handleTogglePlayButton}>
          PLAY | PAUSE
        </div>
      </div>
    );
  }

  componentDidUpdate () {
    try {
      if (!this.props.trackToPlayId) return;

      if (!this._audioContextConnected) {
        this._audioContext = new window.AudioContext();
        const track = this._audioContext.createMediaElementSource(this.audioElement.current);
        track.connect(this._audioContext.destination);
        this.audioElement.current.addEventListener('ended', () => {
          this._playing = false;
          this._logger.log(this, `Track ${this.props.trackToPlayId} ended.`);
        });

        this._audioContextConnected = true;
      }
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  _handleTogglePlayButton () {
    try {
      if (this._audioContext?.state === 'suspended') {
        this._audioContext.resume();
        this._logger.log(this, 'Audio Context resumed.');
        return;
      }

      if (this._playing) {
        this.audioElement.current.pause();
        this._playing = false;
        this._logger.log(this, `Track ${this.props.trackToPlayId} paused.`);
        return;
      }

      this.audioElement.current.play();
      this._playing = true;
      this._logger.log(this, 'Playing track ' + this.props.trackToPlayId);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
