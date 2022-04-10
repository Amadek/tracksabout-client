import React from 'react';
import assert from 'assert';

export default class PlayButton extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.onClick);
    assert.ok(this.props.playing || true);
  }

  render () {
    if (this.props.playing === null) {
      return (
        <span className='spinner-border text-secondary' style={{ width: '2rem', height: '2rem', margin: '1.25rem .5rem' }} role='status' />
      );
    }

    return (
      <i
        className={this.props.playing ? 'bi-pause' : 'bi-play-fill'}
        style={{ fontSize: '3rem' }} role='button'
        onClick={this.props.onClick}
      />
    );
  }
}
