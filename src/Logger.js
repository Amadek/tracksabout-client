import packageInfo from '../package.json';
import debug from 'debug';
debug.enable('*');
debug.log = console.log.bind(this);

export default class Logger {
  log (sender, message) {
    if (!this._debugScope) this._debugScope = debug(packageInfo.name + ':' + this._getSenderName(sender));
    this._debugScope(message);
  }

  _getSenderName (sender) {
    switch (typeof sender) {
      case 'object': return sender.constructor.name;
      case 'string': return sender;
      default: return sender;
    }
  }
}
