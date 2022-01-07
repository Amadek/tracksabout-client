import React from 'react';

export default class Alert extends React.Component {
  render () {
    return (
      <div className={'alert alert-dismissible fade show m-0 ' + (this.props.alertType ?? 'alert-danger') + ' ' + (this.props.className ?? '')} style={{ borderRadius: 0 }}>
        {this.props.message}
        <button type='button' className='btn-close' data-bs-dismiss='alert' aria-label='Close' />
      </div>
    );
  }
}
