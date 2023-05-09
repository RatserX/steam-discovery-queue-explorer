import ElementHelper from '../../helpers/element-helper';

export default (props = {}) => {
  props.id = props.id ?? 'sqde-game';

  const platform = {
    linux: props.os_linux ? '<span class="platform_img linux"></span>' : '',
    macos: props.os_macos ? '<span class="platform_img mac"></span>' : '',
    windows: props.os_windows ? '<span class="platform_img win"></span>' : '',
  };

  const text = `
<a class="game" href="https://store.steampowered.com/app/${props.gameId}/${props.urlName}" id="${props.id}" target="_blank">
  <img class="media" src="${props.header}">
  <div class="info">
    <span class="name">${props.name}</span>
    <span class="platform">${platform.windows}${platform.macos}${platform.linux}</span>
  </div>
  <div class="cost">${props.discountBlock}</div>
</a>`;

  ElementHelper.insertAdjacentHTML(text, '#sqde-activity-content', 'beforeend');
};
