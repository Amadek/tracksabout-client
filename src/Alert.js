import React from 'react';

export default class Alert extends React.Component {
  render () {
    return (
      <div className='alert alert-danger m-0 mt-3'>{this.props.message}</div>
    );
  }
}
