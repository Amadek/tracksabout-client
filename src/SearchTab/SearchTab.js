import React from 'react';
import Logger from '../Logger';
import SearchBar from './SearchBar';
import assert from 'assert';
import SearchResult from './SearchResults';
import Alert from '../Alert';
import ContainerHeightProvider from '../ContainerHeightProvider';
import AlbumImagesCache from '../AlbumImagesCache/AlbumImagesCache';

export default class SearchTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(props.tracksAboutApiClient);
    assert.ok(props.containerHeightProvider instanceof ContainerHeightProvider);
    assert.ok(props.albumImagesCache instanceof AlbumImagesCache);
    assert.ok(props.searchTabMessage || true);
    this._logger = new Logger();
    this.handleSearchStarted = this._handleSearchStarted.bind(this);
    this.handleSearchResultClick = this._handleSearchResultClick.bind(this);

    this.state = {
      searchResults: [],
      searchErrorMessage: ''
    };
  }

  render () {
    const searchResults = this.state.searchResults.map((s, index) =>
      <SearchResult
        albumImagesCache={this.props.albumImagesCache}
        key={index} title={s.title}
        searchResult={s}
        onSearchResultClick={this.handleSearchResultClick}
      />);

    return (
      <div className='container pt-3' style={{ ...this.props.containerHeightProvider.provideStyles(), overflowY: 'auto' }}>
        {this.state.searchErrorMessage && <Alert message={this.state.searchErrorMessage} className='mb-3' />}
        {this.props.searchTabMessage && <Alert message={this.props.searchTabMessage} alertType='alert-success' className='mb-3' />}
        <div className='mb-1'>
          Search by artist, album or track name:
        </div>
        <SearchBar onSearchStarted={this.handleSearchStarted} />
        {searchResults}
      </div>
    );
  }

  async _handleSearchStarted (searchPhrase) {
    try {
      assert.ok(searchPhrase);
      const searchActionResult = await this.props.tracksAboutApiClient.search(searchPhrase);

      if (!searchActionResult.success) {
        this._logger.log(this, 'Search failed.');
        this.setState({
          searchResults: [],
          searchErrorMessage: searchActionResult.message
        });
        return;
      }

      this.setState({ searchResults: searchActionResult.searchResults });
    } catch (error) {
      this._logger.log(this, error);
    }
  }

  async _handleSearchResultClick (searchResultId) {
    try {
      assert.ok(searchResultId);
      let searchByIdResult = await this.props.tracksAboutApiClient.searchById(searchResultId);
      if (!searchByIdResult.success) {
        this._logger.log(this, 'Search by Id failed.');
        this.setState({ searchByIDErrorMessage: searchByIdResult.message });
        return;
      }

      if (searchByIdResult.obj.type === 'track') {
        searchByIdResult = await this.props.tracksAboutApiClient.searchById(searchByIdResult.obj.albumId);
      }

      this.props.onSearchResultLoaded(searchByIdResult.obj);
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
