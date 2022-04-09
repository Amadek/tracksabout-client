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
    assert.ok(props.rotateImage || true);
    assert.ok(props.className || true);
    assert.ok(props.style || true);
    this.albumImg = React.createRef();
    this.state = { albumCoverImageLoading: true };
  }

  render () {
    return (
      <div className={this._getClassName()} style={{ position: 'relative', ...this.props.style }}>
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

  _getClassName () {
    const className = 'albumCoverImage';
    const rotateImage = this.props.rotateImage ? 'rotatingAlbumCoverImage' : '';
    const propsClassName = this.props.className ?? '';
    return [className, rotateImage, propsClassName].join(' ');
  }
}
