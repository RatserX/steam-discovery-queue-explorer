import action from './components/action';
import activity from './components/activity';
import game from './components/game';
import style from './components/style';

class App {
  static action = (props) => action(props);
  static activity = (props) => activity(props);
  static game = (props) => game(props);
  static style = (props) => style(props);
}

export default App;
