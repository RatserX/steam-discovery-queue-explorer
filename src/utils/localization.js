import localizationSettings from '../settings/localization-settings';

class Localization {
  static #resource = {};

  static format = (key) => this.#resource[key] ?? key;
  static use = (selectedLanguage) => {
    this.#resource = localizationSettings[selectedLanguage] ?? {};
  };
}

export default Localization;
