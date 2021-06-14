import React from 'react';

export default class Breadcrumb extends React.Component {
  render () {
    return (
      <div className='bg-light ps-2'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item active' aria-current='page'>Home</li>
          </ol>
        </nav>
      </div>
    );
  }
}
