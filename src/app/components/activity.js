import Localization from '../../utils/localization';
import State from '../../utils/state';
import ElementHelper from '../../helpers/element-helper';

export default (props = {}) => {
  props.id = props.id ?? 'sqde-activity';

  const activityProgressValue = State.get('activityProgressValue');
  const gameCount = State.get('gameCount');

  const listenerObject = {
    handleActivityProgressValueState: (event) => {
      const activityProgressValue = event.detail;
      const target = event.target;
      target.style.width = `${activityProgressValue}%`;
    },
    handleGameCountState: (event) => {
      const gameCount = event.detail;
      const target = event.target;
      target.innerHTML = gameCount;
    },
    handleIsMaximizedState: (event) => {
      const isMaximized = event.detail;
      const target = event.target;
      const action = isMaximized ? 'add' : 'remove';
      target.classList[action]('maximize');
    },
    handleResizeClick: () => {
      const key = 'isMaximized';
      const isMaximized = State.get(key);
      State.set(key, !isMaximized);
    },
  };

  const text = `
<div id="${props.id}">
  <div id="sqde-activity-status" ${ElementHelper.generateEvents([
    'state',
    'handleIsMaximizedState',
    'isMaximized',
  ])}>
    <div class="info">
      <span>${Localization.format('Games explored')}: <span ${ElementHelper.generateEvents([
    'state',
    'handleGameCountState',
    'gameCount',
  ])}>${gameCount}</span></span>
    </div>
    <a class="resize" href="#" title="Resize" ${ElementHelper.generateEvents([
      'click',
      'handleResizeClick',
    ])}>
      <div class="expander">&nbsp;</div>
    </a>
  </div>
  <div id="sqde-activity-content" ${ElementHelper.generateEvents([
    'state',
    'handleIsMaximizedState',
    'isMaximized',
  ])}></div>
  <div id="sqde-activity-progress">
    <div class="value" style="width: ${activityProgressValue}%" ${ElementHelper.generateEvents([
    'state',
    'handleActivityProgressValueState',
    'activityProgressValue',
  ])}></div>
  </div>
</div>`;

  ElementHelper.insertAdjacentHTML(text, 'body', 'beforeend');
  ElementHelper.registerEvents(props.id, listenerObject);
};
