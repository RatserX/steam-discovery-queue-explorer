export default class HostHelper {
  static base = (url) => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}${url}`;
  };

  static query = (url, name) => {
    const separatedUrls = url.split('?');
    const init = separatedUrls[1];
    const searchParameters = new URLSearchParams(init);
    return searchParameters.get(name);
  };

  static serialize = (init) => {
    const searchParameters = new URLSearchParams(init);
    return searchParameters.toString();
  };
}
