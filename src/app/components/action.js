import Localization from '../../utils/localization';
import State from '../../utils/state';
import Connection from '../../connection/connection';
import ElementHelper from '../../helpers/element-helper';
import appSettings from '../../settings/app-settings';
import App from '../app';

export default (props = {}) => {
  props.id = props.id ?? 'sqde-action';

  const listenerObject = {
    handleActionClick: async () => {
      ElementHelper.removeContent('#sqde-activity');

      State.set('activityProgressValue', 0);
      State.set('gameCount', 0);
      State.set('exploreRetry', 0);
      State.set('queueId', 0);

      App.activity();

      const data = await Connection.explore();
      const gameLength = data.queue.length;

      let queueId = State.get('queueIndex');
      State.set('gameIndex', 0);
      State.set('gameLength', gameLength);

      data.queue.forEach(async (gameId) => {
        const rgAppDataItem = data.rgAppData[gameId];
        const props = {
          id: `sqde-game-${queueId}-${gameId}`,
          gameId,
          queueId,
          discountBlock: rgAppDataItem.discount_block,
          header: rgAppDataItem.header,
          name: rgAppDataItem.name,
          os_linux: rgAppDataItem.os_linux,
          os_macos: rgAppDataItem.os_macos,
          os_windows: rgAppDataItem.os_windows,
          urlName: rgAppDataItem.url_name,
        };

        State.set(`appRetry${gameId}`, 0);
        App.game(props);

        await Connection.app(gameId);

        let gameIndex = State.get('gameIndex');
        const gameCount = State.get('gameCount');
        const gameLength = State.get('gameLength');

        const activityProgressValue = ((gameIndex + 1) * 100) / gameLength;

        State.set('activityProgressValue', activityProgressValue);
        State.set('gameCount', gameCount + 1);

        if (++gameIndex < gameLength) {
          State.set('gameIndex', gameIndex);
        } else {
          if (++queueId < appSettings.queue.identifierMax) {
            State.set('queueId', queueId);
            Connection.explore();
          }
        }
      });
    },
  };

  const text = `
<div id="${props.id}" class="discovery_queue_customize_ctn">
  <div class="btnv6_blue_hoverfade btn_medium" ${ElementHelper.generateEvents([
    'click',
    'handleActionClick',
  ])}>
    <span>${Localization.format('Explore your queue')}</span>
  </div>
  <span> ${Localization.format('Explore the products in your queue')}. </span>
</div>`;

  ElementHelper.insertAdjacentHTML(text, '.discovery_queue_customize_ctn', 'beforebegin');
  ElementHelper.registerEvents(props.id, listenerObject);
};
