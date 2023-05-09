import action from './components/action';

class App {
  static action = (props) => action(props);
  static activity = (props) => activity(props);
  static game = (props) => game(props);
  static style = (props) => style(props);
}

export default App;
