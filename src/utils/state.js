import helpers from '../helpers/element-helper';

class State {
  static #storage = {};

  static get = (name) => this.#storage[name];
  static set = (name, value) => {
    const currentValue = this.get(name);
    if (currentValue !== value) {
      this.#storage[name] = value;
      helpers.Element.dispatchEvent('state', value, name);
    }
  };
}

export default State;
