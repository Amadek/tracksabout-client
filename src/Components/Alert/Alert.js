import React from 'react';
import './Alert.css';
import { CSSTransition } from 'react-transition-group';

export default class Alert extends React.Component {
  constructor () {
    super();
    this.state = { visible: false };
  }

  render () {
    return (
      <CSSTransition
        in={this.state.visible}
        timeout={300}
        classNames='alert'
        unmountOnExit
      >
        <div className={this.getClassName()} style={{ borderRadius: 0, ...this.props.style }}>
          {this.props.message}
          <button type='button' className='btn-close' onClick={() => this.setState({ visible: false })} />
        </div>
      </CSSTransition>
    );
  }

  componentDidMount () {
    this.setState({ visible: true });

    setTimeout(() => this.setState({ visible: false }), 3000);
  }

  componentWillUnmount () {
    this.setState({ visible: false });
  }

  getClassName () {
    const baseClassName = 'alert alert-dismissible fade show m-0';
    const alertType = this.props.alertType ?? 'alert-danger';
    const propsClassName = this.props.className ?? '';

    return [baseClassName, alertType, propsClassName].join(' ');
  }
}
