import Logger from '../Logger';
import assert from 'assert';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';
import AlbumCoverImage from './AlbumCoverImage';

export default class DynamicAlbumCoverImage extends AlbumCoverImage {
  constructor (props) {
    super(props);
    assert.ok(props.albumId);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    this._logger = new Logger();
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
