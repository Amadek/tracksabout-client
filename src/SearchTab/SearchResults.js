import React from 'react';

export default class SearchResult extends React.Component {
  render () {
    return (
      <div className='row border-bottom'>
        <div className='col-12 py-3'>
          <div className='fs-5' onClick={() => this.props.onSearchResultClick(this.props.searchResult._id)}>{this.props.searchResult.title}</div>
          {this.props.searchResult.albumName && <span className='text-secondary me-3'>{this.props.searchResult.albumName}</span>}
          {this.props.searchResult.artistName && <span className='text-secondary'>{this.props.searchResult.artistName}</span>}
        </div>
      </div>
    );
  }
}
