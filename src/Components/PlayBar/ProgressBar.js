import React from 'react';
import assert from 'assert';

export default class ProgressBar extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.trackProgress || true);
  }

  render () {
    return (
      <div className='progress border-top' style={{ borderRadius: 0, height: '.25rem' }}>
        <div className='progress-bar m-0' role='progressbar' style={{ width: this.props.trackProgress + '%', height: '.5rem' }} />
      </div>
    );
  }
}
