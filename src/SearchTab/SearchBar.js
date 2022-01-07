import React from 'react';

export default class SearchBar extends React.Component {
  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.timeoutId = null;
    this.state = { searchPhrase: '' };
  }

  handleChange (e) {
    const searchPhrase = e.target.value;
    this.setState({ searchPhrase });
    // Stop timeout if one started below is already running.
    clearTimeout(this.timeoutId);

    if (!searchPhrase || searchPhrase.length < 3) return;

    this.timeoutId = setTimeout(() => {
      this.props.onSearchStarted(searchPhrase);
    }, 500);
  }

  componentWillUnmount () {
    clearTimeout(this.timeoutId);
  }

  render () {
    return (
      <form>
        <input className='form-control' value={this.state.searchPhrase} onChange={this.handleChange} style={{ borderRadius: 0 }} />
      </form>
    );
  }
}
