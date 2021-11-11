import React from 'react';
import assert from 'assert';
import './AlbumCoverImage.css';

/**
 * @abstract
 */
export default class AlbumCoverImage extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.albumName || true);
    assert.ok(props.albumYear || true);
    this.albumImg = React.createRef();
    this.state = { albumCoverImageLoading: true };
  }

  render () {
    return (
      <div className='albumCoverImage' style={{ position: 'relative' }}>
        {this.props.albumName && this.props.albumYear &&
          <div className='p-3 bg-dark text-light albumDetailsFadeIn' style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <span className='fs-3'>{this.props.albumName}</span><br />
            {this.props.albumYear}
          </div>}
        <img
          ref={this.albumImg}
          src='#'
          alt={this.props.albumName}
          className={this.state.albumCoverImageLoading ? 'visually-hidden' : ''}
          style={{ width: '100%' }}
        />
        {this.state.albumCoverImageLoading && <div className='border' style={{ width: '100%', paddingTop: '100%' }} />}
      </div>
    );
  }

  /**
   * @abstract
   */
  async componentDidMount () { }
}
