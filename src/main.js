import App from "./app/app";
import Localization from "./utils/localization";
import ElementHelper from "./helpers/element-helper";
import HostHelper from "./helpers/host-helper";

(() => {
  const selectedLanguage = HostHelper.query(window.location.href, 'l');
  Localization.use(selectedLanguage);

  ElementHelper.removeContent('#sqde-style');
  App.style();

  ElementHelper.removeContent('#sqde-action');
  App.action();
})();
