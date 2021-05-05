import React from 'react';

export default class LoadingTrack extends React.Component {
  render () {
    return (
      <div className={'row' + (this.props.showBorder ? ' border-top' : '')}>
        <div className='col-10 fs-5 p-0 py-3'>{this.props.fileName}</div>
        <div className={'col-2 d-flex align-items-center' + (this.props.processingMessage ? '' : ' visually-hidden')}>
          <div className='spinner-border me-3' />
          <strong>{this.props.processingMessage}</strong>
        </div>
      </div>
    );
  }
}
