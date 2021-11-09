import React from 'react';
import AlbumCoverImage from '../AlbumCoverImage';
import assert from 'assert';
import SearchResultType from './SearchResultType';

export default class SearchResult extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.albumImagesCache);
    assert.ok(props.searchResult);
  }

  render () {
    return (
      <div className='row'>
        <div className='col-12'>
          <div className='border-bottom py-3'>
            <div
              className='fs-5' role='button'
              onClick={() => this.props.onSearchResultClick(this.props.searchResult._id)}
            >
              <div className='d-flex flex-row'>
                {this._getAlbumId() &&
                  <div className='me-3 mt-2' style={{ width: '3rem' }}>
                    <AlbumCoverImage albumId={this._getAlbumId()} albumImagesCache={this.props.albumImagesCache} />
                  </div>}
                <div>
                  {this.props.searchResult.title}
                  {this.props.searchResult.albumName && <span className='text-secondary fs-6 ms-2'>{this.props.searchResult.albumName}</span>}
                  <br />
                  {this.props.searchResult.artistName && <span className='text-secondary'>{this.props.searchResult.artistName}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  _getAlbumId () {
    switch (this.props.searchResult.type) {
      case SearchResultType.track: return this.props.searchResult.albumId;
      case SearchResultType.album: return this.props.searchResult._id;
      case SearchResultType.artist: return null;
      default: throw new Error(this.props.searchResult.type);
    }
  }
}
