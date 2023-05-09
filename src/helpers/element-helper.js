export default class ElementHelper {
  static dispatchEvent = (type, value, name = null) => {
    const parsedType = name ? `${type}_${name}` : type;
    const selectors = name
      ? `[data-event-${type}-name="${name}"]`
      : `[data-event-${type}-listener]`;

    const event = new CustomEvent(parsedType, { detail: value });
    const nodes = document.querySelectorAll(selectors);
    nodes.forEach((node) => node.dispatchEvent(event));
  };

  static generateEvents = (...events) => {
    const dataEventAttributes = [];
    const dataEventTypes = [];

    events.forEach(([type, listener, name]) => {
      let attribute = `data-event-${type}-listener="${listener}"`;
      if (name) attribute += ` data-event-${type}-name="${name}"`;

      dataEventAttributes.push(attribute);
      dataEventTypes.push(type);
    });

    return `data-event="${dataEventTypes.join(',')}" ${dataEventAttributes.join(' ')}"`;
  };

  static insertAdjacentHTML = (text, selectors, position = 'afterend') => {
    document.querySelectorAll(selectors).forEach((node) => node.insertAdjacentHTML(position, text));
  };

  static registerEvents = (id, listenerObject) => {
    document.querySelectorAll(`#${id} [data-event]`).forEach((node) => {
      const event = node.getAttribute('data-event');
      const types = event.split(',');

      types.forEach((type) => {
        const listener = node.getAttribute(`data-event-${type}-listener`);
        const name = node.getAttribute(`data-event-${type}-name`);

        if (listener in listenerObject) {
          const parsedListener = listenerObject[listener];
          const parsedType = name ? `${type}_${name}` : type;
          node.addEventListener(parsedType, parsedListener);
        }
      });
    });
  };

  static removeContent = (selectors) => {
    document.querySelectorAll(selectors).forEach((node) => node.parentNode.removeChild(node));
  };
}
