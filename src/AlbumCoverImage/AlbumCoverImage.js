import React from 'react';
import Logger from '../Logger';
import assert from 'assert';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';
import './AlbumCoverImage.css';

export default class AlbumCoverImage extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.albumId);
    assert.ok(props.albumName || true);
    assert.ok(props.albumYear || true);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    this._logger = new Logger();
    this._ignoreUpdate = false;
    this.albumImg = React.createRef();
    this.state = {
      albumCoverImageLoading: true
    };
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
          alt={this.props.albumId}
          className={this.state.albumCoverImageLoading ? 'visually-hidden' : ''}
          style={{ width: '100%' }}
        />
        {this.state.albumCoverImageLoading && <div className='border' style={{ width: '100%', paddingTop: '100%' }} />}
      </div>
    );
  }

  async componentDidMount () {
    try {
      const albumCover = await this.props.albumImagesCache.getAlbumCover(this.props.albumId);

      this.albumImg.current.src = `data:${albumCover.format};base64,${albumCover.data}`;
      this.setState({ albumCoverImageLoading: false });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async componentDidUpdate (prevProps) {
    try {
      if (prevProps.albumId === this.props.albumId) return;

      this.setState({ albumCoverImageLoading: true });

      const albumCover = await this.props.albumImagesCache.getAlbumCover(this.props.albumId);
      const imgData = `data:${albumCover.format};base64,${albumCover.data}`;
      this.albumImg.current.src = imgData;

      this.setState({ albumCoverImageLoading: false });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
