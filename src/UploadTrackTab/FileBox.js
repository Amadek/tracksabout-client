import React from 'react';

export default class FileBox extends React.Component {
  constructor (props) {
    super(props);
    this.handleDragOverFileBox = this._handleDragOverFileBox.bind(this);
    this.handleDragLeaveFileBox = this._handleDragLeaveFileBox.bind(this);
    this.state = { fileOverFileBox: false };
  }

  render () {
    return (
      <div className='row'>
        <div className='col'>
          <div
            className={'border p-5 mt-3' + (this.state.fileOverFileBox ? ' border-4' : '')} role='button'
            onClick={this.props.onFileBoxClick} onDrop={this.props.onDropToFileBox} onDragOver={this.handleDragOverFileBox} onDragLeave={this.handleDragLeaveFileBox}
            // TODO zrobić akcje na zakończeniu dropa pliku.
          >
            <div className='text-center fst-italic'>Drag tracks here...</div>
          </div>
        </div>
      </div>
    );
  }

  _handleDragOverFileBox (event) {
    event.preventDefault();
    this.setState({ fileOverFileBox: true });
  }

  _handleDragLeaveFileBox (event) {
    event.preventDefault();
    this.setState({ fileOverFileBox: false });
  }
}
