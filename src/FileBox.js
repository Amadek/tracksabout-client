import React from 'react';

export default class FileBox extends React.Component {
  constructor () {
    super();
    this.handleDragOverFileBox = this._handleDragOverFileBox.bind(this);
    this.handleDragLeaveFileBox = this._handleDragLeaveFileBox.bind(this);
    this.state = { fileOverFileBox: false };
  }

  render () {
    return (
      <div className='row'>
        <div className='col p-0 pt-4 pb-2'>
          <div
            className={'border m-0 p-5' + (this.state.fileOverFileBox ? ' border-4' : '')} role='button'
            onClick={this.props.onFileBoxClick} onDrop={this.props.onDropToFileBox} onDragOver={this.handleDragOverFileBox} onDragLeave={this.handleDragLeaveFileBox}
            // TODO zrobić akcje na zakończeniu dropa pliku.
          >
            <p className='text-center m-0 fst-italic'>Drag tracks here...</p>
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
