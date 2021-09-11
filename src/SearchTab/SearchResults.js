import React from 'react';

export default class SearchResult extends React.Component {
  render () {
    return (
      <div className='row'>
        <div className='col-12'>
          <div className='border-bottom py-3'>
            <div
              className='fs-5' role='button'
              onClick={() => this.props.onSearchResultClick(this.props.searchResult._id)}
            >
              {this.props.searchResult.title}
              {this.props.searchResult.albumName && <span className='text-secondary fs-6 ms-2'>{this.props.searchResult.albumName}</span>}
            </div>
            {this.props.searchResult.artistName && <span className='text-secondary'>{this.props.searchResult.artistName}</span>}
          </div>
        </div>
      </div>
    );
  }
}
