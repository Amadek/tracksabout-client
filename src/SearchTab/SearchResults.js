import React from 'react';

export default class SearchResult extends React.Component {
  render () {
    return (
      <div className='row border-bottom'>
        <div className='col-12 py-3'>
          <div className='fs-5'>{this.props.title}</div>
        </div>
      </div>
    );
  }
}
