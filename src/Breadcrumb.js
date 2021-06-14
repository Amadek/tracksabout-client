import React from 'react';

export default class Breadcrumb extends React.Component {
  render () {
    return (
      <div className='bg-light ps-2 py-1'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb m-0'>
            <li className='breadcrumb-item active' aria-current='page'>Home</li>
          </ol>
        </nav>
      </div>
    );
  }
}
