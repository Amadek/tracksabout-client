import packageInfo from '../../package.json';
import debug from 'debug';
debug.enable('*');
debug.log = console.log.bind(this);

export default class Logger {
  log (sender, message) {
    if (!this._debugScope) this._debugScope = debug(packageInfo.name + ':' + this._getSenderName(sender));

    // We do not log errors from interrupting playing audio - it is normal when playing and chanching track to another.
    if (message instanceof Error && message.message.includes('https://goo.gl/LdLk22')) return;

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
