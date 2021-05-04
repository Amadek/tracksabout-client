import React from 'react';

export default class FileBox extends React.Component {
  render () {
    return (
      <div className='row'>
        <div className='col p-0 pt-3 pb-2'>
          <div className='border m-0 p-5' role='button' onClick={this.props.onFileBoxClick}>
            <p className='text-center m-0 fst-italic'>Drag tracks here...</p>
          </div>
        </div>
      </div>
    );
  }
}