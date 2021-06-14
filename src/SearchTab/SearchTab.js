import React from 'react';
import Logger from '../Logger';
import SearchBar from './SearchBar';
import assert from 'assert';
import SearchResult from './SearchResults';

export default class SearchTab extends React.Component {
  constructor (props) {
    super(props);
    assert.ok(this.props.tracksAboutApiClient);
    this._logger = new Logger();
    this.handleSearchStarted = this._handleSearchStarted.bind(this);

    this.state = { searchResults: [] };
  }

  render () {
    const searchResults = this.state.searchResults.map((s, index) => <SearchResult key={index} title={s.title} />);

    return (
      <div className='container pt-4'>
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
        this.setState({ searchResults: [] });
        // TODO wyświeltenie błędu.
        return;
      }

      // TODO mapować jakoś obiekty tracka, albumu i artysy, albo z api zeby przyochdzilo gotowe
      const searchResults = searchActionResult.searchResults.map(s => ({ title: s.trackTitle || s.albumName || s.artistName }));
      this.setState({ searchResults });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
