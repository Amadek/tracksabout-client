import React from 'react';
import assert from 'assert';
import Alert from '../Alert/Alert';

export default class PlayBarAlert extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.message);
  }

  render () {
    return (
      <Alert
        message={this.props.message}
        alertType='alert-secondary'
        style={{ borderRadius: 0, position: 'fixed', width: '700px', left: 'calc(50% - 700px / 2)', bottom: '6rem' }}
      />
    );
  }
}
