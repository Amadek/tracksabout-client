import React from 'react';

export default class Alert extends React.Component {
  render () {
    return (
      <div className='alert alert-danger'>{this.props.message}</div>
    );
  }
}
