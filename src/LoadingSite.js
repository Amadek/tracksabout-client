import React from 'react';

export default class LoadingSite extends React.Component {
  render () {
    return (
      <span
        className='spinner-border text-secondary'
        style={{ width: '8rem', height: '8rem', position: 'absolute', top: '50%', left: '50%', margin: '-4rem 0 0 -4rem' }}
        role='status' aria-hidden='true'
      />
    );
  }
}
