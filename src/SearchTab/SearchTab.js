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
    const searchResults = this.state.searchResults.map((s, index) => <SearchResult key={index} title={s.title} searchResult={s} />);

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

      this._logger.log(this, 'Search results found:\n' + JSON.stringify(searchActionResult.searchResults, null, 2));

      this.setState({ searchResults: searchActionResult.searchResults });
    } catch (error) {
      this._logger.log(this, error);
    }
  }
}
