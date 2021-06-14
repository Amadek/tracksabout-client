import React from 'react';
import Navbar from './Navbar';
import UploadTrackTab from './UploadTrackTab/UploadTrackTab';

export default class App extends React.Component {
  render () {
    return (
      <>
        <Navbar />
        {this.getTab('upload')}
      </>
    );
  }

  getTab (tabName) {
    switch (tabName) {
      case 'upload':
        return <UploadTrackTab />;
    }
  }
}
