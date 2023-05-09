import app from './services/app';
import explore from './services/explore';

class Connection {
  static app = (gameId) => app(gameId);
  static explore = () => explore();
}

export default Connection;
