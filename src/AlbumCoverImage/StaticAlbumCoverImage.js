import AlbumCoverImage from './AlbumCoverImage';
import assert from 'assert';
import Logger from '../Logger';

export default class StaticAlbumCoverImage extends AlbumCoverImage {
  constructor (props) {
    super(props);
    assert.ok(props.albumCover);
    this._logger = new Logger();
  }

  async componentDidMount () {
    try {
      this.albumImg.current.src = `data:${this.props.albumCover.format};base64,${this.props.albumCover.data}`;
      this.setState({ albumCoverImageLoading: false });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
