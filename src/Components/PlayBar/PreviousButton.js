import React from 'react';
import PlayingQueue from '../../Logic/PlayingQueue';
import assert from 'assert';

export default class PreviousButton extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.playingQueue instanceof PlayingQueue);
    assert.ok(this.props.onClick);
    assert.ok(this.props.playing || true);
  }

  render () {
    return (
      <i
        style={{ fontSize: '2rem' }}
        className={this._getClassName()}
        role={this.props.playingQueue.queueStartReached ? '' : 'button'}
        onClick={this.props.onClick}
      />
    );
  }

  _getClassName () {
    const className = 'bi-skip-start me-1';
    const condition = this.props.playingQueue.queueStartReached || this.props.playing === null ? 'text-secondary' : '';
    return [className, condition].join(' ');
  }
}
