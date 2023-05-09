import HostHelper from '../../helpers/host-helper';
import connectionSettings from '../../settings/connection-settings';

export default () => {
  let retry = 0;
  const input = HostHelper.base('/explore/generatenewdiscoveryqueue');
  const promise = () =>
    new Promise((resolve, reject) => {
      let rejectReason = null;
      let willRetry = false;

      fetch(input, {
        body: HostHelper.serialize({
          queuetype: 0,
          sessionid: g_sessionID,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;boundary=;charset=utf-8',
        },
        method: 'POST',
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            !Object.prototype.hasOwnProperty.call(data, 'queue') ||
            !Object.prototype.hasOwnProperty.call(data, 'rgAppData') ||
            !Object.prototype.hasOwnProperty.call(data, 'settings')
          ) {
            willRetry = connectionSettings.explore.retryOnFailedResponse;
            return;
          }

          resolve(data);
        })
        .catch((reason) => {
          rejectReason = reason;
          willRetry = connectionSettings.explore.retryOnFailedRequest;
        })
        .finally(() => {
          if (willRetry && ++retry <= connectionSettings.explore.retryMax) {
            promise().then(resolve).catch(reject);
          } else {
            reject(rejectReason);
          }
        });
    });

  return promise();
};
